# Motivated Seller Lead Generation Platform — Full Build Plan

## What We're Building

A three-sided platform for real estate investor lead generation:

1. **Seller surface** — SEO-optimized, mobile-first landing pages that capture motivated
   homeowners (distressed, foreclosure, inherited property, etc.) across multiple local markets
2. **Investor surface** — Authenticated portal where vetted investors configure buy boxes,
   claim leads via auction, track performance, and manage billing
3. **Operator surface** — Admin dashboard managing markets, investors, lead pipeline, and revenue

Plus a background automation layer: property enrichment, AI qualification scoring, IVR call
routing, auction mechanics, and Stripe billing automation.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSG for seller pages (SEO), SSR for portals, one repo |
| Language | TypeScript everywhere | Non-negotiable at this complexity |
| API layer | tRPC | Type-safe client/server calls, zero schema duplication |
| Database | PostgreSQL via Supabase | Auth + RLS + Realtime + Storage in one service |
| ORM | Prisma | Schema-first, type-safe, migration tooling |
| Auth | Supabase Auth | Built into Supabase, Row Level Security integration |
| Cache / TTL | Upstash Redis | Serverless, pay-per-request, auction TTL management |
| Background jobs | Inngest | Durable job chains with retry, lead processing pipeline |
| Payments | Stripe | Subscriptions + per-lead Payment Intents |
| Voice / IVR | Twilio Programmable Voice | Call routing, recording, IVR, CNAM |
| Speech-to-text | Deepgram | Real-time transcription during IVR calls |
| AI scoring | Anthropic Claude API | Transcript analysis, lead scoring, AI summary |
| AI voice (optional) | ElevenLabs | Natural-sounding IVR voice if conversion testing shows uplift |
| Property data | ATTOM Data API | AVM, ownership verification, foreclosure status |
| Address validation | Melissa Data | Standardize and validate before ATTOM (cost control) |
| Email | Resend | Simple, developer-friendly transactional email |
| Notifications | Knock | Multi-channel (email + SMS + push) notification orchestration |
| Analytics | PostHog | Funnel tracking, session replay, form completion rates |
| Error tracking | Sentry | Required in production |
| Log aggregation | Axiom | Structured logs for IVR service and Inngest jobs |
| CDN / Security | Cloudflare | In front of Vercel, caches seller pages, DDoS protection |
| IVR hosting | Railway | Persistent Node.js service (Twilio Media Streams need WebSocket) |
| Web hosting | Vercel | Zero-config Next.js, Edge functions for geo routing |
| Monorepo | Turborepo | Build caching, shared packages across apps |

### Why the IVR Is a Separate Service

Twilio Media Streams require a persistent WebSocket connection for real-time audio.
Next.js serverless functions time out at 30 seconds — incompatible with a 4–8 minute
qualification call. The IVR service runs as a persistent Node.js process on Railway.
Everything else lives in the Next.js monorepo.

---

## Repository Structure

```
/
├── apps/
│   ├── web/                          # Next.js 14 — all three surfaces
│   │   ├── app/
│   │   │   ├── (seller)/             # Public, SEO routes, no auth
│   │   │   │   ├── [market]/
│   │   │   │   │   ├── page.tsx      # Landing page (SSG per market)
│   │   │   │   │   └── thank-you/
│   │   │   ├── (investor)/           # Supabase Auth protected
│   │   │   │   ├── dashboard/
│   │   │   │   ├── leads/
│   │   │   │   ├── leads/[id]/
│   │   │   │   ├── buy-boxes/
│   │   │   │   └── billing/
│   │   │   ├── (admin)/              # admin_users role check
│   │   │   │   ├── admin/dashboard/
│   │   │   │   ├── admin/leads/
│   │   │   │   ├── admin/investors/
│   │   │   │   ├── admin/markets/
│   │   │   │   └── admin/auctions/
│   │   │   └── api/
│   │   │       ├── trpc/[trpc]/      # tRPC handler
│   │   │       ├── webhooks/
│   │   │       │   ├── twilio/       # voice, recording, status
│   │   │       │   └── stripe/       # billing events
│   │   │       └── inngest/          # Inngest function runner
│   │   └── src/
│   │       ├── inngest/              # Background job definitions
│   │       ├── trpc/                 # tRPC routers
│   │       └── lib/                  # Shared utilities
│   │
│   └── ivr/                          # Node.js IVR service (Railway)
│       └── src/
│           ├── handlers/
│           │   └── call-flow.ts      # IVR state machine
│           └── services/             # Deepgram, Claude, Twilio clients
│
└── packages/
    ├── db/                           # Prisma schema, migrations, client
    │   └── prisma/
    │       └── schema.prisma
    ├── types/                        # Shared TypeScript interfaces
    └── scoring/                      # Lead scoring engine (pure functions)
        └── src/
            └── index.ts
```

---

## Database Schema

### Markets & Landing Pages

```prisma
model Market {
  id              String   @id @default(uuid())
  name            String                          // "Atlanta GA"
  slug            String   @unique               // "atlanta-ga"
  stateCode       String   @db.Char(2)
  countyFips      String[]
  isActive        Boolean  @default(false)
  phoneNumber     String?                         // Twilio number
  metaTitle       String?
  metaDescription String?
  heroHeadline    String?
  heroSubheadline String?
  templateId      String?

  leads              Lead[]
  auctions           Auction[]
  pricingConfigs     PricingConfig[]
  landingPageVariants LandingPageVariant[]
  buyBoxMarkets      BuyBoxMarket[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LandingPageVariant {
  id           String  @id @default(uuid())
  marketId     String
  variantKey   String                    // "control", "variant-a"
  headline     String
  subheadline  String?
  ctaText      String
  trustSignals Json                      // array of trust signal configs
  isActive     Boolean @default(true)
  trafficWeight Int    @default(50)
  conversions  Int     @default(0)
  impressions  Int     @default(0)

  market    Market          @relation(fields: [marketId], references: [id])
  inquiries SellerInquiry[]

  createdAt DateTime @default(now())
}
```

### Seller Funnel

```prisma
model SellerInquiry {
  id              String  @id @default(uuid())
  marketId        String
  variantId       String?

  firstName       String
  lastName        String
  phone           String
  email           String?
  propertyAddress String
  propertyCity    String
  propertyState   String  @db.Char(2)
  propertyZip     String

  situation       String?   // "foreclosure","inherited","divorce","tired_landlord","other"
  timeline        String?   // "asap","1_3_months","3_6_months","just_curious"
  askingPrice     Int?

  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmContent   String?
  ipAddress    String?
  userAgent    String?
  sessionId    String?
  formVersion  String?
  submittedAt  DateTime @default(now())

  market   Market               @relation(fields: [marketId], references: [id])
  variant  LandingPageVariant?  @relation(fields: [variantId], references: [id])
  lead     Lead?

  createdAt DateTime @default(now())
}

model Lead {
  id         String @id @default(uuid())
  inquiryId  String @unique
  marketId   String

  // Seller contact
  firstName       String
  lastName        String
  phone           String
  email           String?
  isPhoneVerified Boolean @default(false)

  // Property
  propertyAddress String
  propertyCity    String
  propertyState   String @db.Char(2)
  propertyZip     String
  propertyCounty  String?
  parcelId        String?
  propertyType    String?   // "sfr","mfr","land","commercial"
  bedrooms        Int?
  bathrooms       Decimal?  @db.Decimal(3, 1)
  sqft            Int?
  yearBuilt       Int?
  lotSqft         Int?

  // Ownership & financial (from enrichment)
  ownerName           String?
  ownerMailingAddress String?
  ownerMatchesSeller  Boolean?
  purchaseDate        DateTime?
  purchasePrice       Int?
  estimatedValue      Int?
  estimatedEquity     Int?
  equityPercentage    Decimal?  @db.Decimal(5, 2)
  openLiens           Int       @default(0)
  lienAmount          Int?
  isInForeclosure     Boolean   @default(false)
  foreclosureStage    String?
  taxDelinquent       Boolean   @default(false)
  taxDelinquentAmount Int?

  // Condition signals
  daysOnMarket    Int?
  lastSaleDate    DateTime?
  occupancyStatus String?   // "owner","tenant","vacant"
  conditionNotes  String?

  // Qualification
  tier              String    // "tier1","tier2","tier3","disqualified"
  score             Int?      // 0-100
  scoreBreakdown    Json?
  disqualifyReason  String?
  aiSummary         String?
  aiFlags           Json?

  // IVR
  ivrCallSid      String?
  ivrCompleted    Boolean  @default(false)
  ivrRecordingUrl String?
  ivrTranscript   String?
  ivrSentiment    String?
  ivrMotivScore   Int?

  // State machine
  status String @default("pending_enrichment")
  // pending_enrichment → pending_scoring → pending_auction →
  // in_auction → claimed → sold → returned → disqualified

  enrichedAt DateTime?
  scoredAt   DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  inquiry              SellerInquiry          @relation(fields: [inquiryId], references: [id])
  market               Market                 @relation(fields: [marketId], references: [id])
  calls                Call[]
  enrichmentResponses  LeadEnrichmentResponse[]
  auction              Auction?
  outcome              LeadOutcome?

  @@index([status, marketId, tier])
  @@index([phone])
}

model LeadEnrichmentResponse {
  id         String @id @default(uuid())
  leadId     String
  provider   String   // "attom","batchdata","melissa"
  endpoint   String
  request    Json
  response   Json
  statusCode Int
  latencyMs  Int

  lead Lead @relation(fields: [leadId], references: [id])

  createdAt DateTime @default(now())
}
```

### IVR & Calls

```prisma
model Call {
  id          String  @id @default(uuid())
  inquiryId   String?
  leadId      String?
  marketId    String
  callSid     String  @unique
  fromPhone   String
  toPhone     String
  direction   String   // "inbound","outbound_followup"
  status      String
  durationSeconds Int?
  recordingUrl    String?
  recordingSid    String?
  transcript      String?
  aiAnalysis      Json?
  disposition     String?  // "qualified","not_ready","unreachable","wrong_number"
  startedAt   DateTime?
  endedAt     DateTime?

  lead      Lead?  @relation(fields: [leadId], references: [id])
  events    CallEvent[]

  createdAt DateTime @default(now())
}

model CallEvent {
  id        String @id @default(uuid())
  callId    String
  eventType String   // "dtmf","speech","gather","say","transfer"
  stepName  String
  input     String?

  call Call @relation(fields: [callId], references: [id])

  createdAt DateTime @default(now())
}
```

### Investors & Buy Boxes

```prisma
model Investor {
  id              String  @id @default(uuid())
  userId          String  @unique  // Supabase Auth user_id
  companyName     String?
  firstName       String
  lastName        String
  email           String  @unique
  phone           String?
  website         String?
  bio             String?

  status          String  @default("pending")  // pending,active,suspended
  membershipTier  String  @default("basic")    // basic,pro,enterprise
  isVerified      Boolean @default(false)

  stripeCustomerId     String? @unique
  stripeSubscriptionId String?

  notificationPrefs Json?
  closeRate         Float?
  disputeRate       Float?

  buyBoxes      BuyBox[]
  auctionClaims AuctionClaim[]
  transactions  Transaction[]
  subscription  Subscription?
  outcomes      LeadOutcome[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BuyBox {
  id         String  @id @default(uuid())
  investorId String
  name       String
  isActive   Boolean @default(true)

  // Geographic
  states          String[]
  zipCodes        String[]

  // Property filters
  propertyTypes       String[]
  minBedrooms         Int?
  maxPurchasePrice    Int?
  minEquityPercent    Decimal? @db.Decimal(5, 2)
  minArv              Int?
  maxArv              Int?
  dealTypes           String[]  // "wholesale","fix_flip","buy_hold"
  maxRepairEstimate   Int?
  acceptedTiers       String[]  @default(["tier1", "tier2"])

  // Notification
  notifyImmediately Boolean @default(true)
  maxLeadsPerDay    Int     @default(10)

  investor      Investor       @relation(fields: [investorId], references: [id])
  markets       BuyBoxMarket[]
  notifications AuctionNotification[]
  claims        AuctionClaim[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BuyBoxMarket {
  id         String @id @default(uuid())
  buyBoxId   String
  marketId   String

  buyBox BuyBox @relation(fields: [buyBoxId], references: [id])
  market Market @relation(fields: [marketId], references: [id])

  @@unique([buyBoxId, marketId])
}
```

### Auction Engine

```prisma
model Auction {
  id        String  @id @default(uuid())
  leadId    String  @unique
  marketId  String
  tier      String
  status    String  @default("open")
  // open → claimed → expired → cancelled

  opensAt    DateTime
  expiresAt  DateTime
  claimedAt  DateTime?
  claimedBy  String?
  claimPrice Int?
  basePrice  Int

  lead   Lead     @relation(fields: [leadId], references: [id])
  market Market   @relation(fields: [marketId], references: [id])

  claims        AuctionClaim[]
  notifications AuctionNotification[]
  routingLog    AuctionRoutingLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, expiresAt])
}

model AuctionClaim {
  id         String @id @default(uuid())
  auctionId  String
  investorId String
  buyBoxId   String
  status     String   // "pending","won","lost","refunded"
  claimedAt  DateTime

  auction  Auction  @relation(fields: [auctionId], references: [id])
  investor Investor @relation(fields: [investorId], references: [id])
  buyBox   BuyBox   @relation(fields: [buyBoxId], references: [id])

  createdAt DateTime @default(now())
}

model AuctionNotification {
  id         String @id @default(uuid())
  auctionId  String
  investorId String
  buyBoxId   String
  channel    String    // "email","sms","push"
  sentAt     DateTime
  openedAt   DateTime?
  clickedAt  DateTime?

  auction  Auction  @relation(fields: [auctionId], references: [id])
  investor Investor @relation(fields: [investorId], references: [id])
  buyBox   BuyBox   @relation(fields: [buyBoxId], references: [id])
}

model AuctionRoutingLog {
  id             String @id @default(uuid())
  auctionId      String
  round          Int
  eligibleCount  Int
  notifiedCount  Int
  expiresAt      DateTime
  outcome        String?   // "claimed","expired_to_next_round"

  auction Auction @relation(fields: [auctionId], references: [id])

  createdAt DateTime @default(now())
}
```

### Billing

```prisma
model Subscription {
  id                     String @id @default(uuid())
  investorId             String @unique
  stripeSubscriptionId   String @unique
  planId                 String   // "basic","pro","enterprise"
  status                 String
  currentPeriodStart     DateTime
  currentPeriodEnd       DateTime
  monthlyLeadCredits     Int     @default(0)
  creditsUsed            Int     @default(0)

  investor Investor @relation(fields: [investorId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id                  String @id @default(uuid())
  investorId          String
  auctionId           String?
  subscriptionId      String?
  type                String    // "lead_purchase","subscription","refund","bonus_credit"
  amountCents         Int
  currency            String    @default("usd")
  status              String    // "pending","succeeded","failed","refunded"
  stripePaymentIntent String?
  stripeChargeId      String?
  description         String?
  metadata            Json?

  investor Investor @relation(fields: [investorId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([investorId, createdAt])
}

model LeadOutcome {
  id         String @id @default(uuid())
  leadId     String @unique
  investorId String
  auctionId  String
  outcome    String    // "closed","fell_through","not_contacted","bad_lead"
  closedPrice    Int?
  reportedAt     DateTime
  verifiedAt     DateTime?
  bonusAmount    Int      @default(0)
  refundIssued   Boolean  @default(false)
  notes          String?

  lead     Lead     @relation(fields: [leadId], references: [id])
  investor Investor @relation(fields: [investorId], references: [id])

  createdAt DateTime @default(now())
}
```

### Admin & System

```prisma
model AdminUser {
  id     String @id @default(uuid())
  userId String @unique
  email  String @unique
  role   String @default("staff")  // "super_admin","staff","billing"

  createdAt DateTime @default(now())
}

model PricingConfig {
  id           String   @id @default(uuid())
  marketId     String?
  tier         String
  basePrice    Int
  isActive     Boolean  @default(true)
  effectiveFrom DateTime

  market Market? @relation(fields: [marketId], references: [id])

  createdAt DateTime @default(now())
}

model AuditLog {
  id         String @id @default(uuid())
  actorId    String?
  actorType  String   // "admin","investor","system"
  action     String   // "lead.claimed","auction.created","investor.suspended"
  entityType String?
  entityId   String?
  beforeState Json?
  afterState  Json?
  ipAddress   String?

  createdAt DateTime @default(now())
}

model Notification {
  id          String @id @default(uuid())
  recipientId String
  type        String   // "new_lead","auction_expiring","payment_failed"
  channel     String   // "email","sms","push"
  payload     Json
  status      String   @default("pending")
  attempts    Int      @default(0)
  sentAt      DateTime?
  error       String?

  createdAt DateTime @default(now())
}
```

---

## Inngest Job Pipeline

The lead processing pipeline is a durable chain of jobs. Each step is independently
retried on failure without restarting from the beginning.

```
onInquirySubmitted
  → validateAndDedup          (check phone+address against existing leads)
  → validateAddress           (Melissa Data — address standardization)
  → enrichPropertyData        (ATTOM Data — AVM, ownership, foreclosure)
  → scoreLead                 (packages/scoring engine + Claude API)
  → createAuction             (if score >= 30, open auction with TTL)
  → notifyMatchingInvestors   (match buy boxes → send via Knock)

onAuctionExpired             (scheduled job, runs every 15 minutes)
  → checkExpiredAuctions
  → reopenAtDiscount          (if configured, re-auction at 50% price)
  → notifyAdminIfUnclaimed

onAuctionClaimed
  → captureStripePayment
  → deliverLeadToInvestor     (unlock full contact details)
  → sendConfirmationEmail

onIvrCallCompleted
  → fetchRecording
  → transcribeWithDeepgram
  → analyzeWithClaude
  → updateLeadScore           (re-score with IVR data, may upgrade tier)
  → triggerAuctionIfReady

onPaymentFailed
  → suspendInvestorLeadAccess
  → notifyInvestor
  → routeLeadsToBackup
```

---

## tRPC Router Map

```typescript
// Investor-facing routers
leads.list(filters, cursor)         // claimed leads with outcome data
leads.get(id)                       // full lead detail (post-claim only)
leads.preview(id)                   // redacted preview (pre-claim)
leads.reportOutcome(id, outcome)    // investor reports closed/fell through

auctions.listActive()               // open auctions matching investor's buy boxes
auctions.get(id)
auctions.claim(id)                  // claim lead, triggers Stripe charge
auctions.getHistory(cursor)

buyBoxes.list()
buyBoxes.create(input)
buyBoxes.update(id, input)
buyBoxes.delete(id)
buyBoxes.testMatch(id)              // preview how many current leads match

billing.getSubscription()
billing.getTransactions(cursor)
billing.createPortalSession()       // Stripe customer portal redirect
billing.getUsageSummary()

// Admin-only routers
adminLeads.list(filters, cursor)
adminLeads.get(id)
adminLeads.overrideTier(id, tier)
adminLeads.reassign(id, investorId)
adminLeads.refund(id)

adminInvestors.list(filters, cursor)
adminInvestors.get(id)
adminInvestors.approve(id)
adminInvestors.suspend(id, reason)

adminMarkets.list()
adminMarkets.create(input)
adminMarkets.update(id, input)
adminMarkets.deployTemplate(id)

adminAuctions.list(filters)
adminAuctions.forceExpire(id)
adminAuctions.manualClaim(id, investorId)

analytics.revenueOverview(period)
analytics.leadFunnel(marketId)
analytics.investorPerformance(investorId)
analytics.conversionBySource()
```

---

## Webhook Routes (Not tRPC)

```
POST /api/webhooks/twilio/voice          → TwiML IVR responses
POST /api/webhooks/twilio/recording      → Recording complete callback
POST /api/webhooks/twilio/transcription  → Transcription complete
POST /api/webhooks/twilio/status         → Call status updates
POST /api/webhooks/stripe                → Stripe billing events
POST /api/inngest                        → Inngest function runner
```

---

## Lead Scoring Engine

Lives in `packages/scoring/src/index.ts` as pure functions with no external deps.
Fully unit-tested before being wired into any job.

```typescript
// Score ranges: 0-100. Tier assignment:
// Tier 1: 75-100  ($350-500 depending on market)
// Tier 2: 50-74   ($150-250)
// Tier 3: 30-49   ($50-100)
// Disqualified: 0-29

interface ScoreInput {
  equityPercentage: number | null
  situationType: string | null
  timelineDays: number | null
  isInForeclosure: boolean
  taxDelinquent: boolean
  openLiens: number
  ownerMatchesSeller: boolean | null
  isPhoneVerified: boolean
  propertyType: string | null
  daysOnMarket: number | null
  ivrMotivationScore: number | null  // 0-10, null if no IVR yet
}

interface ScoreOutput {
  total: number    // 0-100
  tier: 'tier1' | 'tier2' | 'tier3' | 'disqualified'
  breakdown: {
    equity: number        // 0-30 points
    motivation: number    // 0-25 points
    urgency: number       // 0-25 points
    risk: number          // 0-20 points (inverse: 20 = no risk, 0 = high risk)
  }
  flags: string[]         // ["low_equity","owner_mismatch","high_lien_count"]
}
```

---

## IVR Call Flow State Machine

The IVR runs as an explicit state machine in `apps/ivr/src/handlers/call-flow.ts`.
Each state returns TwiML. Transitions are driven by Twilio webhook callbacks.

```
GREETING
  → "Thank you for calling. You recently requested information
     about selling your property. Is this still something
     you're looking to do? Press 1 for yes, press 2 for no."
  → [1] → MOTIVATION
  → [2] → NURTURE_BRANCH

MOTIVATION
  → "What's the main reason you're considering selling?
     Press 1 for financial hardship, press 2 for inherited property,
     press 3 for foreclosure or behind on payments,
     press 4 for relocation, press 5 for another reason."
  → records motivation_type → TIMELINE

TIMELINE
  → "How soon would you need to close? Press 1 for within
     30 days, press 2 for 1 to 3 months, press 3 for
     3 to 6 months, press 4 if you're flexible."
  → records timeline → PRICE_EXPECTATION

PRICE_EXPECTATION
  → "If we could offer you a fast cash sale with no repairs,
     no agent fees, and no closing costs, what's the minimum
     price you'd need to move forward? Please say your number now."
  → records asking_price → AUTHORIZATION

AUTHORIZATION
  → "Great. We work with a network of vetted local buyers
     who can move quickly. Can we have one of them contact
     you within the next few hours with an offer?"
  → [yes] → CLOSING
  → [no] → SOFT_EXIT

CLOSING
  → "Perfect. We have your property at [address] on file.
     Someone will be in touch very shortly. Have a great day."
  → end call, trigger onIvrCallCompleted job
```

---

## Supabase Row Level Security Policies

These must be written in Phase 0, before any investor queries are written.
They enforce data isolation at the database layer — not just application layer.

```sql
-- Investors can only see their own profile
CREATE POLICY "investor_self_only" ON investors
  FOR ALL USING (user_id = auth.uid());

-- Investors can only see leads they have won auction claims for
CREATE POLICY "investor_claimed_leads_only" ON leads
  FOR SELECT USING (
    id IN (
      SELECT l.id FROM leads l
      JOIN auctions a ON a.lead_id = l.id
      JOIN auction_claims ac ON ac.auction_id = a.id
      WHERE ac.investor_id = (
        SELECT id FROM investors WHERE user_id = auth.uid()
      )
      AND ac.status = 'won'
    )
  );

-- Investors can only see auctions where their buy boxes match
-- (handled at application layer via tRPC, but RLS as safety net)
CREATE POLICY "investor_own_claims_only" ON auction_claims
  FOR ALL USING (
    investor_id = (SELECT id FROM investors WHERE user_id = auth.uid())
  );

-- Investors can only see their own transactions
CREATE POLICY "investor_own_transactions" ON transactions
  FOR SELECT USING (
    investor_id = (SELECT id FROM investors WHERE user_id = auth.uid())
  );

-- Investors can only CRUD their own buy boxes
CREATE POLICY "investor_own_buy_boxes" ON buy_boxes
  FOR ALL USING (
    investor_id = (SELECT id FROM investors WHERE user_id = auth.uid())
  );

-- Admin bypass: admin_users can see everything
CREATE POLICY "admin_full_access" ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
```

---

## Pricing Configuration

Stored in `pricing_config` table, never hardcoded. Global defaults with per-market
overrides. The auction engine reads this at auction creation time.

| Tier | Score Range | Default Price | Description |
|---|---|---|---|
| Tier 1 | 75-100 | $450 | Full intake + property data + high motivation |
| Tier 2 | 50-74 | $200 | Verified owner + equity confirmed + basic qualification |
| Tier 3 | 30-49 | $75 | Address verified + basic interest confirmed |
| Disqualified | 0-29 | — | Not auctioned |

---

## Two-Stage Enrichment (Cost Control)

Do not enrich every form submission immediately. ATTOM costs $0.20-0.30 per lookup.
Expect 15-25% of submissions to be fraudulent or incomplete.

```
Stage 1 — Free, immediate (Melissa Data):
  - Address standardization and USPS validation
  - Phone number type check (flag Google Voice / VoIP as risk signal)
  - Basic fraud heuristics (velocity check: same IP, same phone)
  - If Stage 1 fails → set status="disqualified", set disqualify_reason, stop

Stage 2 — Paid, async (ATTOM Data):
  - Only runs if Stage 1 passes
  - Property AVM (estimated market value)
  - Ownership verification (owner name, matches seller?)
  - Foreclosure status and stage
  - Tax delinquency
  - Open liens and lien amounts
  - Last sale date and price
```

---

## Build Phases

### Phase 0 — Foundation (Week 1-2)

Everything else depends on this being solid. Do not skip ahead.

**What to build:**
- [ ] Turborepo monorepo: `apps/web`, `apps/ivr`, `packages/db`, `packages/types`, `packages/scoring`
- [ ] Supabase project: enable auth, configure RLS policies (write all policies now)
- [ ] Prisma schema: all tables from this document, initial migration
- [ ] Environment variable structure: local `.env`, staging, production (use Doppler or 1Password for secrets)
- [ ] CI: GitHub Actions — `tsc --noEmit`, Prisma validate, unit tests on every PR
- [ ] Next.js app scaffold with route groups: `(seller)`, `(investor)`, `(admin)`

**Claude Code prompts to use:**

```
"Initialize a Turborepo monorepo with two apps (web using Next.js 14 App Router
with TypeScript, ivr using Node.js with TypeScript) and three packages (db with
Prisma, types for shared interfaces, scoring for pure functions). Use pnpm
workspaces. Configure turbo.json with build and dev pipelines. The web app
should have Tailwind CSS and shadcn/ui configured."

"Create the complete Prisma schema in packages/db/prisma/schema.prisma using
the schema defined in the build plan. Use PostgreSQL as the datasource. Include
all models, relations, indexes, and the @@index directives specified. Run
prisma generate after creating the schema."

"Set up Supabase Auth in the Next.js app using the @supabase/ssr package.
Create middleware.ts that protects (investor) and (admin) route groups.
Investor routes require an authenticated session. Admin routes additionally
require the user to exist in the admin_users table. Create the auth layout
and login page for the investor portal."

"Write all Supabase Row Level Security policies for the database as defined
in the build plan. Create a migration file in packages/db/prisma/migrations
that applies these policies. Each policy should have a comment explaining
its purpose."
```

---

### Phase 1 — Seller Landing Pages (Week 3-4)

**What to build:**
- [ ] `app/(seller)/[market]/page.tsx` — reads from `markets` table via Prisma, 404 for inactive markets
- [ ] Mobile-first landing page template: hero, trust signals, progressive form
- [ ] Progressive disclosure form: 3 steps (address + situation → timeline + asking price → contact)
- [ ] Form submission API route: validate, write to `seller_inquiries`, trigger Inngest job
- [ ] Twilio Verify OTP for seller phone number verification
- [ ] Thank you page
- [ ] SEO: dynamic metadata per market, JSON-LD LocalBusiness schema, XML sitemap
- [ ] A/B variant routing based on `landing_page_variants` table

**Claude Code prompts:**

```
"Build the seller landing page at app/(seller)/[market]/page.tsx. The page
is server-rendered and reads the market config from the database using the
market slug from the URL params. If the market doesn't exist or isActive is
false, return notFound(). The page should be mobile-first, load in under 2
seconds, and have: a large headline from market.heroHeadline, a click-to-call
button with the market phone number, a 3-step progressive form component,
and trust signals. Use Next.js generateStaticParams to pre-render all active
markets at build time."

"Build the 3-step progressive form component for the seller landing page.
Step 1: property address (autocomplete via browser, or manual fields for
street, city, state, zip) and situation selector (foreclosure, inherited,
divorce, tired landlord, other). Step 2: timeline selector and optional
asking price. Step 3: first name, last name, phone, email (optional).
Include a progress indicator. On final submit, POST to /api/leads/submit.
After submission, show an inline success state and redirect to /[market]/thank-you."

"Create the form submission API route at app/api/leads/submit/route.ts.
It should: validate all required fields, check for duplicate phone+address in
the last 30 days, write to seller_inquiries table, trigger the Inngest
onInquirySubmitted event, and return a success response with the inquiry ID.
Rate limit to 5 submissions per IP per hour using Upstash Redis."
```

---

### Phase 2 — Property Enrichment & Lead Scoring (Week 5-6)

**What to build:**
- [ ] Melissa Data client in `packages/db/src/clients/melissa.ts`
- [ ] ATTOM Data client in `packages/db/src/clients/attom.ts`
- [ ] Two-stage enrichment Inngest jobs
- [ ] Lead scoring engine in `packages/scoring/src/index.ts`
- [ ] Unit tests for scoring engine (Jest, 100% coverage)
- [ ] Claude API integration for AI summary and flags
- [ ] Lead status state machine with transition validation

**Claude Code prompts:**

```
"Build the lead scoring engine in packages/scoring/src/index.ts as pure
functions with no external dependencies. Implement the ScoreInput and
ScoreOutput interfaces from the build plan. The scoring function should:
calculate equity score (0-30 pts based on equity percentage thresholds),
motivation score (0-25 pts based on situation type and timeline), urgency
score (0-25 pts, higher for foreclosure/tax delinquent/short timeline),
and risk score (0-20 pts inverse: deduct points for owner mismatch, high
lien count, unverified phone). Assign tiers based on total score. Return
an array of flags for notable conditions. Write Jest tests covering all
scoring scenarios including edge cases (null equity, missing IVR data)."

"Create the Inngest function pipeline in apps/web/src/inngest/functions.ts.
Implement the following functions: onInquirySubmitted (triggered by form
submission), enrichAddress (Melissa Data address validation, fail fast on
invalid addresses), enrichPropertyData (ATTOM Data lookup, store full
response in lead_enrichment_responses), scoreLead (run scoring engine +
call Claude API for ai_summary, update lead record), createAuction (if
score >= 30, create auction record with pricing from pricing_config table
and TTL based on tier). Each function should update lead.status as it
progresses through the pipeline."

"Implement the Claude API integration for lead analysis in
apps/web/src/lib/claude-scorer.ts. Given a lead record with all enrichment
data, call the Claude API (claude-sonnet-4-6) to generate: a 2-3 sentence
ai_summary of the seller's situation and property, and an array of ai_flags
identifying risks (low equity, owner mismatch, property in flood zone) or
opportunities (foreclosure urgency, insurance-backed equity, multiple liens
creating motivated seller). Use prompt caching for the system prompt since
it's called frequently. Return structured JSON output."
```

---

### Phase 3 — IVR System (Week 7-9)

Most technically complex phase. The IVR service is a separate Railway deployment.

**What to build:**
- [ ] `apps/ivr` Node.js service: Express + TypeScript
- [ ] Twilio webhook handlers returning TwiML
- [ ] IVR state machine implementing the full call flow
- [ ] Deepgram real-time transcription via WebSocket
- [ ] Post-call Inngest job: transcription → Claude analysis → lead re-score
- [ ] Outbound callback system (call seller after form submission)
- [ ] Call deduplication and spam filtering

**Claude Code prompts:**

```
"Build the IVR service in apps/ivr as a Node.js Express application with
TypeScript. It needs: POST /twilio/voice/inbound (return TwiML for initial
greeting), POST /twilio/voice/gather (handle DTMF and speech input, advance
state machine), POST /twilio/voice/recording (recording complete callback),
POST /twilio/status (call status updates), GET /health. Implement request
signature validation for all Twilio webhooks using X-Twilio-Signature header.
The service should look up the market by the called phone number and load
the appropriate call flow configuration."

"Implement the IVR state machine in apps/ivr/src/handlers/call-flow.ts as
an explicit state machine. States: GREETING, MOTIVATION, TIMELINE,
PRICE_EXPECTATION, AUTHORIZATION, CLOSING, NURTURE_BRANCH, SOFT_EXIT.
Each state is a function that takes the current session state and Twilio
input, returns TwiML as a string, and returns the next state. Store session
state in Upstash Redis keyed by CallSid with a 30-minute TTL. Log each
state transition to the call_events table."

"Implement the post-call processing Inngest job onIvrCallCompleted.
It should: fetch the Twilio recording URL, request Deepgram transcription,
wait for transcription completion, send transcript to Claude API for
motivation scoring and sentiment analysis, update the lead record with
ivrTranscript, ivrSentiment, ivrMotivationScore, and ivrCompleted=true,
re-run the scoring engine with the new IVR data, and update the auction
tier and price if the score changed."
```

---

### Phase 4 — Investor Portal (Week 10-12)

**What to build:**
- [ ] Investor registration and onboarding flow
- [ ] Buy box builder with market selection, property filters, tier preferences
- [ ] Live auction feed with Supabase Realtime subscriptions
- [ ] Lead preview (redacted contact info until claimed)
- [ ] Claim flow with Stripe Payment Intent
- [ ] Claimed leads dashboard with outcome reporting
- [ ] Investor performance dashboard
- [ ] Email/SMS notifications via Knock when matching lead opens

**Claude Code prompts:**

```
"Build the investor onboarding flow in app/(investor). It should be a
multi-step wizard: Step 1 (company info and contact details), Step 2
(buy box setup — market selection from active markets, property type
preferences, equity minimum, max purchase price, deal type preferences),
Step 3 (Stripe payment method setup using Stripe Elements), Step 4
(confirmation with 'pending approval' state). Write to investors and
buy_boxes tables. After completion, show a pending approval screen.
The investor cannot access leads until an admin approves them."

"Build the live auction feed page at app/(investor)/leads/page.tsx.
Use Supabase Realtime to subscribe to new auctions matching the investor's
buy boxes. Each auction card should show: property city/state/zip (no
street address), property type, tier badge with tier explanation, equity
range (e.g. '35-45% equity'), situation type, timeline, and a claim button.
Implement optimistic UI for the claim action. When claimed, immediately
show the full lead detail without a page reload."

"Build the lead detail page at app/(investor)/leads/[id]/page.tsx.
Only accessible after the investor has a won auction_claim for this lead.
Show: full seller contact info with click-to-call, property address with
Google Maps embed, equity breakdown (estimated value, estimated equity,
lien amount), AI summary, motivation flags, IVR recording player (if
available), and an outcome reporting form. The outcome form has options:
closed (with deal amount field), fell through, not contactable, bad lead
(with dispute reason)."
```

---

### Phase 5 — Billing Automation (Week 13-14)

**What to build:**
- [ ] Stripe Customer creation on investor approval
- [ ] Subscription plans: basic/pro/enterprise (Products and Prices)
- [ ] Per-lead Payment Intent at claim time
- [ ] Subscription credit system (pro members get N included leads/month)
- [ ] Stripe Customer Portal integration
- [ ] Stripe webhook handler for all billing events
- [ ] Failed payment handling: suspend investor, route leads to backup
- [ ] Performance bonus logic (Stripe credit note on closed deal)

**Claude Code prompts:**

```
"Implement the Stripe billing integration. Create a Stripe service in
apps/web/src/lib/stripe.ts with functions for: createCustomer (called
on investor approval), createSubscription (after investor selects a plan),
createLeadPaymentIntent (called when investor claims a lead — amount from
auction.claimPrice), capturePaymentIntent (called after lead delivery),
createCustomerPortalSession, and issuePerformanceBonus (create a credit
note when investor reports a closed deal). Store stripe_customer_id and
stripe_subscription_id on the investor record."

"Build the Stripe webhook handler at app/api/webhooks/stripe/route.ts.
Verify webhook signature. Handle these events: payment_intent.succeeded
(update transaction status, trigger lead delivery), payment_intent.payment_failed
(trigger onPaymentFailed Inngest job), customer.subscription.updated
(sync subscription status and plan), customer.subscription.deleted
(suspend investor lead access), invoice.payment_failed (trigger dunning).
All webhook processing should be idempotent — check if the event has
already been processed before acting."

"Implement the subscription credit system. Pro members get a configurable
number of lead credits per month (stored in subscriptions.monthlyLeadCredits).
When an investor claims a lead, first check if they have available credits.
If yes, deduct a credit and charge $0 (record a $0 transaction for audit).
If no, charge the full lead price via Payment Intent. Credits reset on
subscription renewal (triggered by invoice.payment_succeeded webhook).
Show credit balance prominently in the investor dashboard."
```

---

### Phase 6 — Admin Dashboard (Week 15-16)

**What to build:**
- [ ] Admin auth guard middleware
- [ ] Lead pipeline table with filters and manual override controls
- [ ] Investor management: approve, suspend, view activity
- [ ] Market management: create, configure, Twilio number provisioning
- [ ] Auction oversight: all open auctions, force-expire, manual assign
- [ ] Revenue dashboard: by market, by tier, by investor, by source
- [ ] Lead funnel analytics: submission → claimed → closed

**Claude Code prompts:**

```
"Build the admin lead management table at app/(admin)/admin/leads/page.tsx.
It should be a server component with URL-based filter state (market, tier,
status, date range). Use a DataTable component from shadcn/ui with columns
for: created date, market, tier badge, score, status, seller name (masked),
property city, and actions. Actions: view full lead, override tier, reassign
to different investor, issue refund. Implement cursor-based pagination.
The table should handle 10,000+ rows without performance issues."

"Build the revenue analytics dashboard at app/(admin)/admin/dashboard/page.tsx.
Display: total revenue MTD vs last month, revenue by market (bar chart),
revenue by lead tier (pie chart), lead funnel (submission → enriched → scored →
auctioned → claimed → closed outcome reported), top investors by spend,
average lead price by tier over time. Use Recharts for charts. All data
comes from tRPC adminAnalytics procedures that aggregate from transactions,
leads, and lead_outcomes tables."
```

---

### Phase 7 — Scale Infrastructure (Week 17-18)

**What to build:**
- [ ] One-command market deployment (provision Twilio number + create DB record + generate sitemap)
- [ ] Landing page template A/B test framework with automatic winner selection
- [ ] Multi-market buy box matching optimization (currently O(n) per lead, need index)
- [ ] Seasonal demand alerts (admin notified when volume in a market spikes)
- [ ] Market performance comparison dashboard

**Claude Code prompts:**

```
"Build the market deployment script in apps/web/src/scripts/deploy-market.ts.
Given a market config object (name, slug, state, template parameters), it
should: validate the slug is unique, provision a new Twilio phone number via
the Twilio API (search for local numbers in the market's area code, purchase
the first available), create the market record in the database with the
provisioned number, set isActive=true, and output the new market's landing
page URL. Make this runnable as a CLI command with ts-node."

"Optimize the buy box matching query for the auction notification job. Currently
it fetches all active buy boxes and filters in JavaScript. Replace this with
a PostgreSQL function that takes a lead_id and returns matching investor_ids
efficiently. The function should check: buy_box.isActive=true, investor
status=active, market match (buy_box_markets junction or empty array meaning
all markets), equity >= minEquityPercent, estimated value <= maxPurchasePrice,
tier in acceptedTiers, and daily lead cap not exceeded. Add the appropriate
indexes to support this query."
```

---

### Phase 8 — Hardening & Launch (Week 19-20)

**What to build:**
- [ ] Rate limiting on all public routes (Upstash ratelimit)
- [ ] TCPA compliance: explicit consent capture, stored in seller_inquiries, audit log
- [ ] Fraud detection: duplicate velocity checks, VoIP phone flag, address mismatch
- [ ] Load testing with k6 on seller form submission and auction claim
- [ ] Sentry error tracking in both apps
- [ ] Axiom log aggregation for IVR and Inngest
- [ ] Health check endpoints

**Claude Code prompts:**

```
"Implement TCPA compliance in the seller form. Add explicit consent language
to the form's final step: 'By submitting, you consent to be contacted by
phone, text, or email by [Company] and our network of buyers regarding your
property. Message and data rates may apply.' Store consent text, IP address,
timestamp, and form version in seller_inquiries. Add a consent_log table to
the Prisma schema that stores each consent event with a hash of the consent
text for audit purposes."

"Add comprehensive fraud detection to the lead submission pipeline. In the
enrichAddress Inngest function, implement these checks: (1) velocity check —
more than 3 submissions from the same IP in 1 hour is a block, (2) phone
type check — flag VoIP/Google Voice phones using Twilio Lookup, (3) address
duplication — same address submitted by different phones in the last 7 days
gets flagged, (4) owner mismatch — after ATTOM enrichment, if ownerMatchesSeller
is false, set a fraud flag but don't auto-disqualify (needs admin review).
Store all fraud signals in lead.aiFlags."
```

---

## Key Architectural Decisions

### 1. Form-First IVR (Not Phone-First)
Seller submits form → receives SMS with callback number → automated outbound
call within 15 minutes. Higher form completion rates. IVR has property context
before the call starts. Twilio CNAM configuration required for caller ID trust.

### 2. Post-Call AI Analysis (Not Real-Time for v1)
Twilio completes recording → Deepgram transcribes → Claude scores transcript.
Add real-time Twilio Media Streams analysis only if post-call scoring proves
insufficient after 200+ leads.

### 3. Auction Window by Tier
- Tier 1: 48-hour claim window, no discount on re-auction
- Tier 2/3: 72-hour claim window, 50% discount if unclaimed and re-auctioned

### 4. Pricing in Database, Never Hardcoded
All lead prices read from `pricing_config` at auction creation. Supports per-market
overrides. Changing prices for a market requires a DB update, not a code deploy.

### 5. Charge on Claim, Not on Delivery
Stripe Payment Intent created and captured when investor claims the lead.
Defining "qualified lead" in writing in the investor agreement is critical.
Refund policy: if seller is unreachable within 48 hours AND investor
documents contact attempts, issue credit on next purchase.

### 6. Lead Return Window
Investors can mark a lead "not contactable" within 72 hours and it re-enters
auction at 50% of original price. This reduces dispute rate significantly and
builds investor trust. Design the auction state machine to support this from
day one.

### 7. One Twilio Subaccount per Market
Keeps billing, recording storage, and numbers cleanly segmented.
Slightly more overhead to provision, but critical for clean accounting
at 20+ markets.

---

## Third-Party Account Setup Order

Before writing a line of code, create accounts and get API keys for:

1. **Supabase** — create project, get SUPABASE_URL and SUPABASE_ANON_KEY
2. **Vercel** — connect GitHub repo
3. **Railway** — for IVR service
4. **Upstash** — create Redis instance
5. **Inngest** — create account, get signing key
6. **Twilio** — create account, get Account SID and Auth Token, set up CNAM
7. **Stripe** — create account, create products/prices for the 3 membership tiers
8. **ATTOM Data** — contact sales for API access (takes 1-3 days)
9. **Melissa Data** — self-serve API signup
10. **Deepgram** — self-serve API signup
11. **Resend** — create account, verify sending domain
12. **Knock** — create account, configure email + SMS channels
13. **Sentry** — create two projects (web and ivr)
14. **PostHog** — create account, add to seller landing pages and investor portal
15. **Anthropic** — verify Claude API access and rate limits for your use case

---

## Environment Variables Checklist

```bash
# Database
DATABASE_URL=
DIRECT_URL=            # Supabase direct connection for migrations

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# ATTOM Data
ATTOM_API_KEY=

# Melissa Data
MELISSA_API_KEY=

# Deepgram
DEEPGRAM_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=

# Knock
KNOCK_SECRET_API_KEY=
NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY=
KNOCK_FEED_CHANNEL_ID=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
SENTRY_DSN=
```

---

## Revenue Model Summary

| Structure | Price | When |
|---|---|---|
| Tier 1 lead | $350–500 | Per claim (market-configured) |
| Tier 2 lead | $150–250 | Per claim |
| Tier 3 lead | $50–100 | Per claim |
| Pro membership | $500–1,000/mo | Monthly subscription, includes N lead credits |
| Enterprise (territory lease) | $3,000–6,000/mo | Exclusive territory access, minimum volume |
| Performance bonus (credit) | -$200–500 | Issued to investor on verified closed deal |

---

## First Market Economics Validation

Before scaling to multiple markets, validate unit economics with one market:

- Target: 20 form submissions → 15 pass Stage 1 → 12 enriched → 8 scored → 6 auctioned
- Target: 70% auction claim rate (4-5 claimed per month)
- Target: Blended lead price $250 across mix of tiers
- Revenue per month per market: ~$1,000–1,500
- Advertising cost (Google LSA or PPC): $400–600
- Net per market: $600–900/month before fixed costs

Once one market hits this, the expansion playbook is proven. Each additional
market adds roughly $600–900/month net with minimal incremental operational
cost once the infrastructure is in place.
