# Rank & Rent Lead Generation Platform — Service Businesses
## Product Requirements Document & Build Plan

---

## 1. Executive Summary

This document defines the requirements for a multi-market, multi-niche lead generation
platform targeting high-ticket emergency home service businesses. The platform owns the
digital assets (landing pages, phone numbers, map listings), qualifies inbound consumer
calls automatically, and routes pre-qualified leads to a curated contractor network on
a pay-per-qualified-call or flat monthly territory lease model.

The platform is designed to be operated by a single person or small team managing
50-200+ market assets simultaneously, with the technology layer replacing manual
lead routing, billing, and contractor communication.

### What Makes This Different From Existing Operators

| Existing Rank & Rent Operators | This Platform |
|---|---|
| Anonymous landing pages | Branded consumer-facing dispatch network |
| Manual contractor outreach | Self-serve contractor portal |
| Single Google dependency | Multi-channel traffic (GBP, LSA, PPC, Nextdoor, YouTube) |
| Manual billing and invoicing | Automated Stripe billing on call qualification |
| No data advantage | Compound data: call patterns, contractor close rates, market demand |
| 20-50 asset ceiling (manual) | 200+ asset ceiling (automated) |
| Replaceable by any competitor | Network effects: contractor switching costs + consumer brand |

---

## 2. Product Vision

**The brand positioning:** You are not a lead gen vendor. You are operating a branded
emergency dispatch network for home services. Contractors pay for access to your dispatch
network. Consumers call your network when they have an emergency.

**The long-term moat:** Data compounds. Every call processed makes routing smarter.
Every contractor year in the network adds switching costs. Every sub-market where you
rank creates coverage that competitors cannot buy.

**The exit:** At sufficient scale (100+ market assets, $50k+/month), this is an
acquirable asset by home service franchise networks, private equity rollups, or
strategic buyers paying 3-5x annual revenue.

---

## 3. Target Niche (Phase 1 Recommendation)

**Primary Niche:** Crawl Space Encapsulation & Basement Waterproofing

**Why this niche over water damage restoration:**
- Lower Google Ads CPC ($8-25/click vs $40-120 for water damage)
- Less saturated by existing rank & rent operators
- High ticket: $5,000-$12,000 average job
- Contractors are genuinely underserved digitally
- Discovery urgency: real estate transactions, inspector findings, health concerns
- Not a true emergency (less time pressure on routing vs. basement flooding)

**Expansion niches (Phases 2-3):**
- Foundation Repair
- Mold Remediation (standalone)
- Radon Mitigation
- Septic System Repair/Replacement
- Chimney Repair & Restoration

**Primary Target Metro (Phase 1):** Raleigh-Durham, NC
- Sub-markets: Cary, Apex, Wake Forest, Durham, Chapel Hill, Morrisville
- Each sub-market gets its own landing page, phone number, and GBP listing

---

## 4. Core User Personas

### Persona 1: The Homeowner (Consumer)
- Discovered a crawl space problem during home inspection or routine check
- Searching on mobile: "crawl space encapsulation Cary NC" or "basement water intrusion fix near me"
- High urgency (real estate transaction deadline or visible damage)
- Not price-shopping — wants a trusted, fast response
- Does not know or care they're calling a lead gen network

### Persona 2: The Contractor
- Owns a crawl space or waterproofing business with 2-5 crews
- Excellent at the technical work, poor at consistent lead generation
- Paying for HomeAdvisor/Angi but frustrated by lead quality and price
- Wants live inbound calls from homeowners with real jobs, not shared leads
- Willing to pay $200-400/qualified call once trust is established
- Has been burned by lead gen vendors before — skeptical at first

### Persona 3: The Platform Operator (You)
- Managing 20-200 market assets simultaneously
- Not handling individual calls or doing manual routing
- Needs visibility into: lead volume, call quality, contractor performance, revenue
- Needs to deploy new markets fast (under 2 hours per market)
- Needs to handle contractor disputes without manual investigation

---

## 5. System Architecture Overview

```
CONSUMER LAYER (public-facing)
  Landing Pages  →  Forms  →  Click-to-Call

QUALIFICATION LAYER (automated)
  Twilio IVR  →  AI Voice Agent (optional)  →  Call Scoring

ROUTING LAYER (real-time)
  Territory Match  →  Contractor Availability  →  Live Transfer

CONTRACTOR LAYER (authenticated portal)
  Lead Delivery  →  Performance Tracking  →  Billing

ADMIN LAYER (operator dashboard)
  Market Management  →  Analytics  →  Revenue
```

---

## 6. Feature Requirements by Module

---

### Module 1: Market Asset Management

**Purpose:** Deploy and manage the digital properties that generate leads.

#### 1.1 Market Configuration
- Create a market record with: name, slug, niche, state, target sub-markets
- Each market has a dedicated Twilio tracking phone number
- Markets can be active/inactive (toggle off without deleting)
- Market has a primary and backup contractor assigned

#### 1.2 Landing Page System
- Template-based: one master template per niche, deployed per sub-market
- Each sub-market landing page has unique: headline, phone number, meta title,
  meta description, JSON-LD schema, canonical URL
- Pages are statically generated at build time from database records
- Adding a new sub-market requires only a database insert + rebuild trigger
- Mobile-first design: click-to-call button above the fold, loads under 2 seconds
- No navigation, no footer links — single conversion action only

#### 1.3 Landing Page Template (Required Elements)
```
HERO SECTION
  - Headline: "Crawl Space Encapsulation in [Sub-market]"
  - Subheadline: benefit-focused (dry crawl space, lower energy bills, protected home)
  - Primary CTA: large click-to-call button with tracking number
  - Trust indicators: Licensed & Insured, Free Estimates, Local Crews, X+ Jobs Completed

SOCIAL PROOF
  - 3 anonymized job summaries (e.g., "Encapsulated 1,400 sq ft crawl space in Apex — job
    completed in 2 days")
  - Star rating display (populated from contractor's actual reviews, configurable)

SECONDARY FORM
  - For users who won't call: Name, Phone, Best time to call, Brief description
  - Triggers same lead pipeline as a call

TRUST FOOTER
  - Niche-specific certifications
  - Service area zip codes
  - BBB / licensing badges
```

#### 1.4 A/B Testing
- Each market can have up to 3 active page variants
- Traffic weight per variant (e.g., 70/30 control/variant)
- Automatic variant tracking: impressions, form starts, form completions, calls
- Winning variant detection at statistical significance threshold (configurable)
- Admin can manually force a winner

#### 1.5 SEO Infrastructure
- Dynamic XML sitemap including all active market pages
- JSON-LD LocalBusiness schema per page (uses market's phone number and service area)
- Dynamic metadata: title, description, Open Graph tags
- Robots.txt configuration
- Canonical URL management

#### 1.6 GBP Management (Google Business Profile)
- Store GBP listing URL per market in database
- Track GBP status: active, suspended, pending verification
- Scheduled post generation: admin can configure posting cadence and Claude generates
  niche-relevant content
- GBP review monitoring: alert admin when new review posted (via email notification)

---

### Module 2: Lead Capture

**Purpose:** Capture consumer intent via call or form and create a lead record.

#### 2.1 Inbound Call Tracking
- Every market has a unique Twilio number displayed on its landing page
- All calls routed through the platform before reaching contractor
- Call data captured: caller ID, timestamp, duration, market, source
- Calls under 20 seconds flagged as likely spam/misdial (not billed)

#### 2.2 Form Lead Capture
- Name, phone, email (optional), service address, job description, preferred callback time
- Form submission creates a `leads` record with status `form_submitted`
- Triggers outbound callback attempt within 5 minutes via Twilio
- If callback not answered after 3 attempts, moves to `nurture_sequence`

#### 2.3 Lead Deduplication
- Check: same phone number within 30 days → merge, do not create new lead
- Check: same address + same niche within 90 days → flag for admin review
- Duplicate handling: route to same contractor if prior assignment exists

#### 2.4 Source Attribution
- UTM parameters captured on all form submissions
- Dynamic number insertion (DNI) for paid traffic call attribution
  (unique tracking number per ad campaign, forwarded to market's primary number)
- Source field on every lead: organic_search, gsa_lsa, ppc, nextdoor, referral, direct

---

### Module 3: Lead Qualification (IVR)

**Purpose:** Automatically filter spam, verify intent, and qualify leads before
billing the contractor.

#### 3.1 IVR Flow Architecture
The IVR runs as a state machine. Each state returns TwiML. Session state stored in
Redis keyed by CallSid with 30-minute TTL.

```
GREETING STATE
  "Thank you for calling [Brand Name] for [Niche] services in [Market].
   If you're looking to schedule an estimate or have a crawl space concern,
   press 1. For all other inquiries, press 2."
  → [1] → QUALIFICATION
  → [2] → GENERAL_INQUIRY
  → [no input after 8s] → REPEAT_GREETING
  → [no input after repeat] → VOICEMAIL

QUALIFICATION STATE
  "Great. To connect you with a local specialist, please enter
   your 5-digit zip code now."
  → [valid zip in served territory] → ROUTE_CALL
  → [valid zip, outside territory] → OUT_OF_AREA
  → [invalid input] → REPEAT_ZIP
  → [no input] → VOICEMAIL

ROUTE_CALL STATE
  "Perfect. Connecting you now with a licensed specialist
   in [zip's city]."
  → Live transfer to contractor
  → If no answer after 4 rings → FALLBACK_ROUTE
  → Track call duration from this point

FALLBACK_ROUTE STATE
  → Transfer to backup contractor
  → If no answer after 4 rings → VOICEMAIL_WITH_CALLBACK

VOICEMAIL_WITH_CALLBACK STATE
  "We're sorry all of our specialists are currently on other calls.
   Please leave your name and number and a specialist will call you
   back within 30 minutes."
  → Record voicemail
  → Notify contractor via SMS
  → Create callback task in system
```

#### 3.2 Call Quality Threshold
- Qualified call = connected call lasting **90+ seconds** after live transfer
- Under 90 seconds = not billed (contractor can verify via recording)
- Over 90 seconds = billable event, triggers Stripe charge
- Call duration tracked from moment of live transfer, not from IVR start
- All calls recorded (Twilio recording, stored in Supabase Storage)

#### 3.3 Call Transcription & AI Analysis
- Post-call: Deepgram transcribes recording
- Claude analyzes transcript for:
  - Job type confirmation (is it actually a crawl space job?)
  - Estimated job scope (small/medium/large)
  - Homeowner urgency level (1-5)
  - Spam/solicitor detection
  - Dispute risk flag (if caller seemed angry or confused)
- Analysis stored on lead record, visible to admin, hidden from contractor

#### 3.4 IVR Customization Per Market
- Greeting uses market's configured brand name
- Zip code validation against market's served zip code list
- Routing order configured per market (primary → backup → voicemail)
- Hold music per niche (configurable audio file URL)

---

### Module 4: Lead Routing Engine

**Purpose:** Match qualified leads to the right contractor in real time.

#### 4.1 Territory Configuration
- Each contractor configures served zip codes (can overlap between contractors)
- Each contractor configures service types they accept
- If multiple contractors serve a zip code:
  - **Exclusive mode:** First contractor to pick up gets the call (not billed if rejected)
  - **Auction mode:** Admin assigns a primary; secondary gets calls if primary doesn't answer
  - **Round-robin mode:** Alternates between contractors (configurable)
- Mode is configurable per market by admin

#### 4.2 Routing Logic (Execution Order)
```
1. Incoming call to market tracking number
2. IVR filters and collects zip code
3. Routing engine queries: which contractors serve this zip?
4. Apply routing mode (exclusive/auction/round-robin)
5. Attempt live transfer to primary contractor
6. If no answer in 4 rings → attempt fallback contractor
7. If no fallback or fallback doesn't answer → voicemail + SMS alert
8. All routing steps logged in call_routing_events table
```

#### 4.3 Contractor Availability
- Contractors can set hours of operation (calls outside hours go straight to voicemail)
- Contractors can toggle "pause lead flow" (e.g., crew on vacation)
- Admin can override and force-pause any contractor
- "Pause" does not cancel subscription — just stops routing temporarily

#### 4.4 The "Flip the Switch" Mechanism
- If a contractor's payment fails or subscription is cancelled:
  - Automated Inngest job runs within 5 minutes
  - Primary contractor on all their markets is changed to backup
  - Contractor receives automated email: "Your lead flow has been paused due to a
    payment issue. Update your payment method to resume."
- This is the core business leverage — communicated clearly at onboarding

---

### Module 5: Contractor Portal

**Purpose:** Self-service portal where contractors manage their account,
view leads, track performance, and manage billing.

#### 5.1 Contractor Onboarding Flow
```
Step 1: Account Creation
  - Email + password (Supabase Auth)
  - Company name, contact name, phone, website, license number

Step 2: Service Configuration
  - Select niche(s) served
  - Enter served zip codes (map picker interface)
  - Upload proof of licensing/insurance (stored in Supabase Storage)

Step 3: Territory Selection
  - View available markets in their area
  - See estimated monthly call volume per market (based on current data)
  - Select desired markets

Step 4: Billing Setup
  - Stripe payment method (card or ACH bank transfer — ACH preferred for B2B)
  - View pricing: per-call rate or monthly territory lease
  - Accept terms of service (includes explicit "flip the switch" language)

Step 5: Confirmation
  - Account status: pending admin approval
  - Admin notified for manual vetting
```

#### 5.2 Contractor Dashboard
**Overview panel:**
- Calls this month (total / qualified / billed)
- Spend this month
- Average call duration
- Estimated jobs closed (self-reported)
- Account status indicator

**Recent calls panel:**
- List of all calls: date, duration, zip code, status (qualified/not qualified/disputed)
- Click to listen to recording
- Click to dispute a call

**Territory map:**
- Visual map showing served zip codes
- Overlay: call volume heat map
- Active/inactive toggle per zip

**Billing panel:**
- Current billing model (per-call or monthly lease)
- This month's charges
- Payment history
- Update payment method
- Download invoices

#### 5.3 Lead Detail View
For each qualified call, contractor sees:
- Call date, time, duration
- Caller zip code and city
- Call recording player
- Transcript (if enabled for their plan)
- Dispute button (with required reason selection)

Contractor does NOT see:
- Caller's name or phone number before the call (revealed during live transfer only)
- Other contractors in the network
- Platform's cost structure or margins

#### 5.4 Dispute Resolution
- Contractor can dispute a call within 7 days of billing
- Dispute reasons: wrong service type, outside territory, spam/solicitor, duplicate
- Dispute creates a flag in admin dashboard for manual review
- Admin decision is final (stated in terms of service)
- If dispute upheld: automatic Stripe refund issued
- Contractor with dispute rate > 20% gets flagged for review

---

### Module 6: Billing Automation

**Purpose:** Charge contractors automatically based on call events,
handle failures, and generate invoices without manual intervention.

#### 6.1 Billing Models

**Model A: Pay-Per-Qualified-Call**
- Contractor is charged automatically when a call reaches 90+ seconds
- Charge fires via Stripe Payment Intent after call ends
- Price per call configured per market/niche (stored in pricing_config table)
- Contractor's saved payment method is charged immediately
- Invoice generated automatically and emailed

**Model B: Monthly Territory Lease**
- Contractor pays flat monthly fee for exclusive access to one or more markets
- Implemented as Stripe Subscription (monthly recurring)
- Fee charged on 1st of each month
- All qualified calls in that market route to this contractor exclusively
- If payment fails: automated pause within 5 minutes, next competitor activated

**Model C: Hybrid (most common at scale)**
- Base monthly fee (lower) + reduced per-call rate
- Example: $500/month + $150/call (vs. $250/call on pure per-call)
- Implemented as Stripe Subscription + Usage-Based Billing

#### 6.2 Stripe Integration Requirements

**Customer management:**
- Stripe Customer created on contractor approval
- Payment method setup via Stripe Elements (embedded in portal)
- Support card, ACH bank debit (better for B2B recurring)

**Per-call billing:**
- Payment Intent created when call hits 90-second mark
- Payment captured immediately
- Transaction record created in database
- Contractor notified via email with receipt

**Subscription billing (territory lease):**
- Stripe Subscription with monthly price
- Subscription created after admin approval + territory selection
- Dunning: Stripe handles 3 retry attempts over 8 days
- On final failure: webhook triggers contractor suspension + competitor activation

**Failed payment handling (critical path):**
```
1. Stripe sends invoice.payment_failed webhook
2. Inngest job fires: decrement contractor.payment_failures_count
3. If failures >= 1: send payment failure email to contractor
4. If failures >= 2: pause contractor's lead flow
5. If failures >= 3 (or subscription cancelled): activate backup contractor,
   send contractor "your account has been suspended" email
6. Admin notified of all failure events
```

#### 6.3 Pricing Configuration
All prices stored in `pricing_config` table, never hardcoded.
Supports per-niche and per-market pricing overrides.

Default per-call pricing by niche:
- Crawl Space Encapsulation: $225/qualified call
- Foundation Repair: $275/qualified call
- Mold Remediation: $200/qualified call
- Radon Mitigation: $175/qualified call

Default monthly lease pricing:
- Single sub-market: $1,200-2,500/month
- Full metro market (all sub-markets): $3,500-6,500/month

#### 6.4 Invoice Generation
- Auto-generated PDF invoice for every billing event
- Includes: company name, call date, duration, zip code, charge amount
- Emailed to contractor's billing email automatically
- Available in contractor portal for download
- Monthly summary statement generated on the 1st

---

### Module 7: Admin Dashboard

**Purpose:** Operator control plane for managing markets, contractors,
revenue, and system health.

#### 7.1 Overview Dashboard
- Revenue: today / this week / this month / all time
- Active markets: count, calls today
- Active contractors: count, calls handled today
- Call volume chart: 30-day rolling
- Alerts panel: payment failures, disputed calls, GBP issues

#### 7.2 Market Management
- Create new market (triggers Twilio number provisioning workflow)
- View all markets: status, call volume, revenue, active contractors
- Edit market: change landing page content, routing mode, pricing
- Deactivate market (no calls routed, page shows "unavailable")
- Market performance: calls/month trend, conversion rate, revenue trend

#### 7.3 Contractor Management
- Pending approval queue (with licensing doc viewer)
- Approve or reject with reason
- View contractor profile: contact info, territories, billing status
- View contractor performance: calls received, call duration distribution,
  close rate (self-reported), dispute rate
- Manual actions: pause, suspend, reassign territories, adjust pricing

#### 7.4 Lead Pipeline View
- All leads across all markets, filterable by: market, status, date range, niche
- Lead detail: call recording, transcript, AI analysis, routing events, billing status
- Manual lead actions: reassign to different contractor, issue refund, mark as spam

#### 7.5 Call Analytics
- Average call duration by market
- Qualification rate (calls that reach 90+ seconds / total calls)
- Routing success rate (connected to contractor / total qualified calls)
- Voicemail rate by market and by contractor (high voicemail rate = contractor problem)
- Peak call times by market (informs contractor staffing recommendations)

#### 7.6 Revenue Analytics
- Revenue by market (bar chart, monthly)
- Revenue by niche
- Revenue by contractor
- Revenue by billing model (per-call vs. monthly lease)
- Monthly recurring revenue (MRR) trend
- Churn: cancelled contractors and lost MRR
- Projected revenue based on current run rate

#### 7.7 System Health
- Twilio webhook failure log
- Stripe webhook failure log
- Inngest job failure log
- Failed call routing events (calls that hit voicemail due to system error)
- API error rate by integration

---

### Module 8: Intelligence Layer

**Purpose:** The data advantage that compounds over time.

#### 8.1 Lead Scoring (Post-Call)
After every call, Claude analyzes the transcript and scores:
- Job type match (0-10): is it actually the niche service being advertised?
- Urgency (0-10): how urgent does the homeowner sound?
- Job scope estimate (small/medium/large): based on description
- Dispute risk (low/medium/high): signals that contractor might dispute billing
- Estimated job value: rough estimate based on scope signals

This data is stored but not shown to contractors. Used by admin for:
- Identifying markets with high dispute risk
- Understanding which ad copy attracts larger jobs
- Contractor performance evaluation

#### 8.2 Contractor Performance Scoring
Each contractor has a system-calculated reliability score (0-100):
- Answer rate: % of routed calls answered within 4 rings (weight: 40%)
- Dispute rate: % of qualified calls disputed (weight: 30%, inverse)
- Subscription payment reliability: on-time payments (weight: 20%)
- Self-reported close rate: % of leads resulting in jobs (weight: 10%)

Score displayed in admin only. Used for:
- Priority routing (higher score = primary position)
- Market expansion decisions
- Pricing negotiations

#### 8.3 Market Demand Analytics
Aggregate data across all leads:
- Call volume by hour of day (peak times)
- Call volume by day of week
- Seasonal volume patterns
- Geographic heat map of call origins within market
- Average call duration trend

Used for:
- Recommending contractor staffing times
- Predicting revenue for new markets
- Seasonal traffic spend adjustment recommendations

#### 8.4 Market Opportunity Scoring
Before deploying a new market, score it automatically:
- Estimated monthly search volume (from Google Keyword Planner API or similar)
- Current GBP competition (number of listings for niche keywords)
- Estimated CPC for paid traffic
- Contractor density (number of potential partners in the area)
- Projected monthly revenue based on comparable markets

Admin can run this scoring from the "Add Market" flow before committing to deployment.

---

## 7. Technical Architecture

### Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Landing pages (SSG), portals (SSR), webhooks |
| Language | TypeScript | Required for this complexity |
| API | tRPC | Type-safe client/server, zero REST boilerplate |
| Database | PostgreSQL via Supabase | Auth + RLS + Realtime + Storage |
| ORM | Prisma | Schema-first, migrations |
| Auth | Supabase Auth | Contractor portal + admin auth |
| Cache | Upstash Redis | IVR session state, rate limiting, job locks |
| Background Jobs | Inngest | Call processing pipeline, billing automation |
| Voice/IVR | Twilio Programmable Voice | IVR, call recording, live transfer |
| Transcription | Deepgram | Post-call transcription |
| AI Analysis | Anthropic Claude API | Call analysis, content generation, scoring |
| Payments | Stripe | Per-call Payment Intents + Subscriptions |
| Email | Resend | Contractor notifications, invoices |
| Hosting | Vercel | Next.js, Edge functions for geo routing |
| IVR Service | Railway | Persistent Node.js (Twilio WebSocket) |
| Monitoring | Sentry | Error tracking |
| Analytics | PostHog | Conversion funnel, session replay |

### Repository Structure

```
/
├── apps/
│   ├── web/                              # Next.js 14
│   │   ├── app/
│   │   │   ├── (consumer)/               # Public, SEO landing pages
│   │   │   │   └── [niche]/[market]/
│   │   │   │       ├── page.tsx          # Landing page (SSG)
│   │   │   │       └── thank-you/
│   │   │   ├── (contractor)/             # Auth-protected contractor portal
│   │   │   │   ├── dashboard/
│   │   │   │   ├── calls/
│   │   │   │   ├── calls/[id]/
│   │   │   │   ├── territories/
│   │   │   │   ├── billing/
│   │   │   │   └── onboarding/
│   │   │   ├── (admin)/                  # Admin-only
│   │   │   │   ├── admin/dashboard/
│   │   │   │   ├── admin/markets/
│   │   │   │   ├── admin/contractors/
│   │   │   │   ├── admin/calls/
│   │   │   │   └── admin/revenue/
│   │   │   └── api/
│   │   │       ├── trpc/[trpc]/
│   │   │       └── webhooks/
│   │   │           ├── twilio/
│   │   │           └── stripe/
│   │   └── src/
│   │       ├── inngest/                  # Background job definitions
│   │       ├── trpc/                     # tRPC routers
│   │       └── lib/                      # Shared utilities + API clients
│   │
│   └── ivr/                              # Node.js IVR service (Railway)
│       └── src/
│           ├── call-flow.ts              # IVR state machine
│           └── services/                 # Twilio, Deepgram, Claude clients
│
└── packages/
    ├── db/                               # Prisma schema + client
    ├── types/                            # Shared TypeScript interfaces
    └── scoring/                          # Lead scoring (pure functions, tested)
```

---

## 8. Complete Database Schema

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── MARKETS & ASSETS ──────────────────────────────────────────

model Niche {
  id          String   @id @default(uuid())
  slug        String   @unique   // "crawl-space", "foundation-repair"
  name        String             // "Crawl Space Encapsulation"
  description String?
  isActive    Boolean  @default(true)

  pricingConfigs PricingConfig[]
  markets        Market[]

  createdAt DateTime @default(now())
}

model Market {
  id          String  @id @default(uuid())
  nicheId     String
  name        String            // "Raleigh-Durham NC"
  slug        String  @unique   // "raleigh-durham-nc"
  stateCode   String  @db.Char(2)
  phoneNumber String?           // Twilio tracking number
  twilioNumberSid String?
  isActive    Boolean @default(false)
  routingMode String  @default("primary_fallback")
  // primary_fallback | round_robin | auction

  gbpUrl      String?
  gbpStatus   String? // "active","suspended","pending"

  heroHeadline    String?
  heroSubheadline String?
  metaTitle       String?
  metaDescription String?
  templateId      String  @default("standard")

  niche        Niche              @relation(fields: [nicheId], references: [id])
  subMarkets   SubMarket[]
  leads        Lead[]
  contractorMarkets ContractorMarket[]
  pricingConfig PricingConfig[]
  pageVariants  PageVariant[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SubMarket {
  id          String   @id @default(uuid())
  marketId    String
  name        String             // "Cary"
  slug        String             // "cary-nc"
  zipCodes    String[]
  phoneNumber String?            // sub-market specific number (optional)
  metaTitle   String?
  isActive    Boolean  @default(true)

  market Market @relation(fields: [marketId], references: [id])
  leads  Lead[]

  @@unique([marketId, slug])
}

model PageVariant {
  id           String  @id @default(uuid())
  marketId     String
  variantKey   String
  headline     String
  subheadline  String?
  ctaText      String  @default("Call Now — Free Estimate")
  trustSignals Json    // array of {icon, text}
  isActive     Boolean @default(true)
  trafficWeight Int    @default(100)
  impressions  Int     @default(0)
  formStarts   Int     @default(0)
  conversions  Int     @default(0) // calls + form submissions

  market Market @relation(fields: [marketId], references: [id])

  @@unique([marketId, variantKey])
  createdAt DateTime @default(now())
}

model PricingConfig {
  id          String  @id @default(uuid())
  nicheId     String?
  marketId    String?
  billingModel String  // "per_call" | "monthly_lease" | "hybrid"
  perCallPrice Int     // cents — price charged per qualified call
  leasePrice   Int?    // cents — monthly flat fee (if applicable)
  minCallSeconds Int   @default(90)  // qualification threshold
  isActive    Boolean @default(true)

  niche  Niche?  @relation(fields: [nicheId], references: [id])
  market Market? @relation(fields: [marketId], references: [id])

  createdAt DateTime @default(now())
}

// ─── LEADS & CALLS ─────────────────────────────────────────────

model Lead {
  id          String  @id @default(uuid())
  marketId    String
  subMarketId String?
  source      String? // "organic","lsa","ppc","nextdoor","form","referral"
  utmSource   String?
  utmMedium   String?
  utmCampaign String?

  // Caller info (from IVR collection or form)
  callerPhone    String
  callerName     String?
  callerEmail    String?
  callerZip      String?
  serviceAddress String?
  jobDescription String?
  preferredTime  String?

  // Status
  status String @default("new")
  // new | ivr_in_progress | qualified | routed | connected |
  // voicemail | not_qualified | duplicate | spam

  // Qualification result
  isQualified     Boolean @default(false)
  qualifiedReason String?     // why qualified or why not
  jobType         String?     // confirmed service type from IVR/transcript
  estimatedScope  String?     // "small","medium","large"
  urgencyScore    Int?        // 1-5
  disputeRisk     String?     // "low","medium","high"

  // AI Analysis
  aiSummary   String?
  aiFlags     Json?

  market    Market     @relation(fields: [marketId], references: [id])
  subMarket SubMarket? @relation(fields: [subMarketId], references: [id])
  calls     Call[]
  assignments LeadAssignment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([marketId, status, createdAt])
  @@index([callerPhone, createdAt])
}

model Call {
  id      String @id @default(uuid())
  leadId  String?
  marketId String

  // Twilio data
  callSid       String  @unique
  fromPhone     String
  toPhone       String
  direction     String  @default("inbound")
  status        String  // twilio status
  durationSeconds Int?

  // Recording
  recordingUrl    String?
  recordingSid    String?
  recordingStatus String?

  // Transcription & Analysis
  transcript    String?
  transcriptStatus String?
  aiAnalysis    Json?     // Claude analysis output

  // IVR tracking
  ivrPath         Json?   // array of states visited
  ivrZipCollected String?
  ivrCompleted    Boolean @default(false)
  ivrDisposition  String? // "qualified","spam","wrong_number","out_of_area","voicemail"

  // Billing
  durationAtQualification Int?   // duration when 90s threshold crossed
  billedAt                DateTime?
  billingEventId          String?

  startedAt DateTime?
  endedAt   DateTime?

  lead           Lead?          @relation(fields: [leadId], references: [id])
  routingEvents  CallRoutingEvent[]
  assignment     LeadAssignment?

  createdAt DateTime @default(now())

  @@index([leadId])
  @@index([callSid])
}

model CallRoutingEvent {
  id         String @id @default(uuid())
  callId     String
  eventType  String
  // "ivr_start","zip_collected","routing_attempt","answer","no_answer",
  // "fallback","voicemail","connected","call_ended"
  contractorId String?
  attemptNumber Int?
  outcome      String?
  metadata     Json?

  call Call @relation(fields: [callId], references: [id])

  createdAt DateTime @default(now())
}

// ─── CONTRACTORS ───────────────────────────────────────────────

model Contractor {
  id          String @id @default(uuid())
  userId      String @unique  // Supabase Auth user_id
  companyName String
  contactName String
  phone       String
  email       String @unique
  website     String?
  licenseNumber String?
  licenseState  String?
  insuranceDocs String?  // Supabase Storage path

  status      String @default("pending")
  // pending | active | paused | suspended | churned

  billingModel String @default("per_call")
  // per_call | monthly_lease | hybrid

  // Performance metrics (updated by background jobs)
  reliabilityScore   Int?      // 0-100, system calculated
  answerRate         Float?    // % calls answered
  disputeRate        Float?    // % calls disputed
  selfReportedCloseRate Float?
  paymentFailures    Int       @default(0)

  // Stripe
  stripeCustomerId     String? @unique
  stripePaymentMethod  String?

  // Notifications
  notifyViaSms      Boolean @default(true)
  notifyViaEmail    Boolean @default(true)
  smsNotifyPhone    String?   // can differ from account phone

  markets      ContractorMarket[]
  assignments  LeadAssignment[]
  transactions BillingTransaction[]
  subscription ContractorSubscription?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ContractorMarket {
  id           String @id @default(uuid())
  contractorId String
  marketId     String
  isPrimary    Boolean @default(true)  // primary vs. backup position
  priority     Int     @default(1)     // 1=first, 2=second fallback, etc.
  isActive     Boolean @default(true)
  isPaused     Boolean @default(false) // contractor manually paused

  // Operating hours (JSON array of {day, startHour, endHour})
  operatingHours Json?
  timezone       String @default("America/New_York")

  // Custom zip code overrides for this market
  servedZipCodes String[]  // empty = all market zips

  contractor Contractor @relation(fields: [contractorId], references: [id])
  market     Market     @relation(fields: [marketId], references: [id])

  @@unique([contractorId, marketId])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── ASSIGNMENTS & BILLING ─────────────────────────────────────

model LeadAssignment {
  id           String @id @default(uuid())
  leadId       String
  callId       String @unique
  contractorId String
  marketId     String

  status       String @default("routed")
  // routed | connected | completed | disputed | refunded

  routedAt     DateTime @default(now())
  connectedAt  DateTime?
  completedAt  DateTime?

  finalDurationSeconds Int?
  wasQualified         Boolean @default(false)

  // Self-reported outcome
  jobBooked     Boolean?
  jobValue      Int?    // contractor self-reports job value in cents
  reportedAt    DateTime?

  // Dispute
  isDisputed     Boolean   @default(false)
  disputeReason  String?
  disputedAt     DateTime?
  disputeResolvedAt DateTime?
  disputeOutcome  String?  // "upheld","rejected"

  lead         Lead         @relation(fields: [leadId], references: [id])
  call         Call         @relation(fields: [callId], references: [id])
  contractor   Contractor   @relation(fields: [contractorId], references: [id])
  transaction  BillingTransaction?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BillingTransaction {
  id           String @id @default(uuid())
  contractorId String
  assignmentId String? @unique
  subscriptionId String?

  type         String
  // per_call_charge | monthly_lease | refund | credit | dispute_refund

  amountCents  Int
  currency     String @default("usd")
  status       String
  // pending | succeeded | failed | refunded

  stripePaymentIntentId String?
  stripeChargeId        String?
  stripeInvoiceId       String?
  description           String?

  contractor   Contractor       @relation(fields: [contractorId], references: [id])
  assignment   LeadAssignment?  @relation(fields: [assignmentId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([contractorId, createdAt])
}

model ContractorSubscription {
  id                   String @id @default(uuid())
  contractorId         String @unique
  stripeSubscriptionId String @unique
  stripePriceId        String
  planType             String  // "single_market" | "metro" | "statewide"
  status               String  // mirrors Stripe subscription status
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean @default(false)

  contractor Contractor @relation(fields: [contractorId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── ADMIN & SYSTEM ────────────────────────────────────────────

model AdminUser {
  id     String @id @default(uuid())
  userId String @unique  // Supabase Auth user_id
  email  String @unique
  role   String @default("staff")  // super_admin | staff | billing

  createdAt DateTime @default(now())
}

model AuditLog {
  id         String @id @default(uuid())
  actorId    String?
  actorType  String   // admin | contractor | system
  action     String
  entityType String?
  entityId   String?
  before     Json?
  after      Json?
  ipAddress  String?
  metadata   Json?

  createdAt DateTime @default(now())

  @@index([entityType, entityId])
  @@index([createdAt])
}

model SystemNotification {
  id          String @id @default(uuid())
  recipientId String
  recipientType String  // contractor | admin
  type        String
  // payment_failed | dispute_filed | new_contractor | market_deployed
  // call_volume_alert | contractor_suspended
  channel     String   // email | sms
  payload     Json
  status      String   @default("pending")
  sentAt      DateTime?
  error       String?

  createdAt DateTime @default(now())
}
```

---

## 9. tRPC Router Map

```typescript
// Contractor-facing
contractors.getProfile()
contractors.updateProfile(input)
contractors.updateNotificationPrefs(input)

territories.list()
territories.addMarket(marketId, zipCodes, operatingHours)
territories.removeMarket(marketId)
territories.updateZips(marketId, zipCodes)
territories.setPaused(marketId, isPaused)

calls.list(filters, cursor)         // contractor's received calls
calls.get(id)                       // call detail + recording URL
calls.dispute(id, reason)           // file a dispute
calls.reportOutcome(id, outcome)    // report job booked + value

billing.getSummary()
billing.getTransactions(cursor)
billing.createPortalSession()       // Stripe portal
billing.getInvoice(id)              // download invoice PDF

// Admin-facing
adminMarkets.list()
adminMarkets.create(input)
adminMarkets.update(id, input)
adminMarkets.deployTemplate(id)     // provision Twilio number + activate page
adminMarkets.getPerformance(id)

adminContractors.list(filters)
adminContractors.get(id)
adminContractors.approve(id)
adminContractors.suspend(id, reason)
adminContractors.setPrimary(contractorId, marketId)
adminContractors.setBackup(contractorId, marketId, priority)

adminCalls.list(filters, cursor)
adminCalls.get(id)
adminCalls.resolveDispute(id, outcome, notes)
adminCalls.manualRefund(id)

adminRevenue.overview(period)
adminRevenue.byMarket(period)
adminRevenue.byContractor(period)
adminRevenue.mrr()

adminAnalytics.callVolume(marketId, period)
adminAnalytics.qualificationRate(marketId)
adminAnalytics.contractorPerformance(contractorId)
adminAnalytics.marketOpportunityScore(input)  // pre-deployment scoring
```

---

## 10. Inngest Job Pipeline

```typescript
// Triggered by Twilio webhook when call ends
onCallCompleted
  → fetchCallRecording()
  → transcribeWithDeepgram()
  → analyzeWithClaude()        // job type, scope, urgency, dispute risk
  → updateLeadRecord()
  → checkQualification()       // was call 90+ seconds?
  → if qualified: createBillingCharge()
  → updateContractorMetrics()  // update answerRate, reliability score

// Triggered by Stripe webhook
onPaymentFailed
  → incrementFailureCount()
  → if failures >= 1: sendPaymentFailureEmail()
  → if failures >= 2: pauseContractorLeadFlow()
  → if failures >= 3: suspendContractor() + activateBackupContractor()
  → notifyAdmin()

onSubscriptionCancelled
  → suspendContractor()
  → activateBackupContractor()
  → sendChurnEmail()
  → notifyAdmin()

// Scheduled: runs every 15 minutes
checkContractorAvailability
  → foreach active contractor_market:
  →   check if current time is within operating hours
  →   update is_available flag in Redis (used by routing engine)

// Scheduled: runs daily at 6am
updateContractorReliabilityScores
  → recalculate reliabilityScore for all active contractors
  → flag contractors with score < 40 for admin review
  → update priority ordering in markets

// Scheduled: runs on 1st of month
generateMonthlyStatements
  → foreach active contractor:
  →   aggregate all transactions for the month
  →   generate PDF statement
  →   email to contractor

// Triggered manually by admin
deployNewMarket
  → validateMarketConfig()
  → provisionTwilioNumber()     // Twilio API: search + purchase local number
  → configureTwilioWebhook()    // point number to IVR service
  → activateMarketRecord()
  → invalidateNextJsCache()     // trigger static page regeneration
  → notifyAdmin("Market deployed successfully")
```

---

## 11. IVR State Machine Detail

```typescript
// apps/ivr/src/call-flow.ts

type IVRState =
  | 'GREETING'
  | 'QUALIFICATION'
  | 'ZIP_COLLECTION'
  | 'ROUTING'
  | 'FALLBACK_ROUTING'
  | 'VOICEMAIL'
  | 'OUT_OF_AREA'
  | 'GENERAL_INQUIRY'

interface CallSession {
  callSid: string
  marketId: string
  state: IVRState
  zipCollected?: string
  primaryContractorId?: string
  routingAttempt: number
  startedAt: Date
}

// Key routing behavior:
//
// 1. Zip collected → query ContractorMarket for matching contractors
//    ordered by isPrimary DESC, priority ASC, reliabilityScore DESC
//
// 2. Check Redis for contractor availability (updated every 15 min by scheduler)
//    Skip unavailable contractors (outside hours or paused)
//
// 3. Attempt live transfer via Twilio <Dial> with callerId = market number
//    so contractor sees the market's number, not the homeowner's number
//    (preserves homeowner privacy and platform control)
//
// 4. Set 90-second timer on Redis when Dial connects.
//    When 90s elapses: fire Inngest onCallQualified event for billing
//
// 5. If Dial returns "no-answer" or "busy" after 4 rings:
//    increment routingAttempt, try next contractor
//
// 6. If all contractors exhausted: VOICEMAIL state
//    Record voicemail, notify contractors via SMS
```

---

## 12. Supabase RLS Policies

```sql
-- Contractors can only see their own profile
CREATE POLICY "contractor_own_profile" ON contractors
  FOR ALL USING (user_id = auth.uid());

-- Contractors can only see their own markets
CREATE POLICY "contractor_own_markets" ON contractor_markets
  FOR ALL USING (
    contractor_id = (SELECT id FROM contractors WHERE user_id = auth.uid())
  );

-- Contractors can only see calls/leads assigned to them
CREATE POLICY "contractor_own_assignments" ON lead_assignments
  FOR SELECT USING (
    contractor_id = (SELECT id FROM contractors WHERE user_id = auth.uid())
  );

-- Contractors can only see their own transactions
CREATE POLICY "contractor_own_transactions" ON billing_transactions
  FOR SELECT USING (
    contractor_id = (SELECT id FROM contractors WHERE user_id = auth.uid())
  );

-- Calls: contractors can only see calls where they have an assignment
CREATE POLICY "contractor_assigned_calls" ON calls
  FOR SELECT USING (
    id IN (
      SELECT call_id FROM lead_assignments
      WHERE contractor_id = (SELECT id FROM contractors WHERE user_id = auth.uid())
    )
  );

-- Admin bypass: admin_users see everything
CREATE POLICY "admin_full_access_leads" ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
```

---

## 13. Build Phases & Claude Code Prompts

---

### Phase 0 — Foundation (Days 1-7)

**Goal:** Infrastructure in place, nothing broken, CI running.

**Tasks:**
- [ ] Initialize Turborepo monorepo (apps/web, apps/ivr, packages/db, packages/types, packages/scoring)
- [ ] Supabase project: enable auth, create DB, write all RLS policies
- [ ] Prisma schema with all tables from Section 8
- [ ] Environment variable structure (local .env, staging, production)
- [ ] GitHub Actions CI: tsc --noEmit, prisma validate, unit tests on PR
- [ ] Next.js app scaffold with route groups: (consumer), (contractor), (admin)
- [ ] Supabase Auth wired into Next.js middleware protecting (contractor) and (admin) routes

**Claude Code Prompt — Monorepo Setup:**
```
Initialize a Turborepo monorepo with pnpm workspaces. Create these packages:
- apps/web: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- apps/ivr: Node.js with Express and TypeScript, no frontend
- packages/db: Prisma schema targeting PostgreSQL, generate client
- packages/types: shared TypeScript interfaces only, no dependencies
- packages/scoring: pure TypeScript functions, no external dependencies, Jest configured

Configure turbo.json with build, dev, and test pipelines. The web app's
dev command should also watch packages/db for changes.
```

**Claude Code Prompt — Prisma Schema:**
```
Create the complete Prisma schema in packages/db/prisma/schema.prisma
using the schema defined in the SERVICE_LEADGEN_PRD.md file.
Use PostgreSQL datasource with DATABASE_URL and DIRECT_URL env vars.
Include all models, relations, indexes, and enum-style string fields
as documented. Run `prisma generate` after schema creation.
Create an initial migration named "initial_schema".
```

**Claude Code Prompt — Supabase Auth:**
```
Set up Supabase Auth in apps/web using @supabase/ssr.
Create middleware.ts that:
1. Protects all routes under (contractor) — requires authenticated session
2. Protects all routes under (admin) — requires authenticated session
   AND existence of the user's auth.uid() in the admin_users table
3. Redirects unauthenticated users to /login
4. Passes session to server components via cookies

Create a login page at app/(auth)/login/page.tsx with email/password form.
Create a separate auth layout that centers the login card.
```

---

### Phase 1 — Consumer Landing Pages (Days 8-18)

**Goal:** Ranking pages live and generating inbound calls.

**Tasks:**
- [ ] Landing page template (one per niche, parameterized)
- [ ] Dynamic routing: /[niche]/[market]/page.tsx reads from DB
- [ ] Multi-step form with progressive disclosure
- [ ] Click-to-call tracking
- [ ] Form submission API → lead creation → Inngest trigger
- [ ] Thank you page
- [ ] SEO: metadata, JSON-LD, sitemap, robots.txt
- [ ] A/B variant routing

**Claude Code Prompt — Landing Page Template:**
```
Build the consumer landing page at app/(consumer)/[niche]/[market]/page.tsx.

The page is a Next.js Server Component. It:
1. Reads niche and market slugs from params
2. Queries the database for Market (with niche join) where slugs match and isActive=true
3. Returns notFound() if market doesn't exist or isn't active
4. Renders the landing page template with market-specific content

The landing page design requirements:
- Mobile-first, must load under 2 seconds, single conversion action only
- NO navigation bar, NO footer links
- Hero: H1 headline from market.heroHeadline, subheadline, and a large click-to-call
  button with the market's phone number formatted as (XXX) XXX-XXXX
- Trust bar: 4 icons with text — "Licensed & Insured", "Free Estimates",
  "Local Crews", "X+ Jobs Completed"
- 3 anonymized job summary cards (configurable per market via heroContent JSON field)
- Multi-step form component (described separately)
- Service area footer: list of served zip codes
- JSON-LD LocalBusiness schema for the market

Use Tailwind CSS. The click-to-call button should be sticky on mobile
(fixed to bottom of viewport on screens < 768px).

Implement generateStaticParams to pre-render all active markets at build time.
Implement generateMetadata for dynamic SEO metadata per market.
```

**Claude Code Prompt — Multi-Step Form:**
```
Build a multi-step lead capture form component at
apps/web/src/components/LeadCaptureForm.tsx.

Step 1 — Situation:
  - Service address (street, city, state, zip)
  - Situation selector: radio cards with icons
    Options vary by niche (passed as prop). For crawl space:
    "I had a home inspection", "I see water/moisture", "I smell mold",
    "I'm buying/selling a home", "Other concern"

Step 2 — Timeline & Description:
  - How soon do you need service? (radio: ASAP, Within a week, This month, Just exploring)
  - Brief description textarea (optional, max 300 chars)

Step 3 — Contact Info:
  - First name, last name
  - Phone number (with format validation)
  - Email (optional)
  - Explicit TCPA consent checkbox: "By submitting, I consent to be contacted by
    phone, text, or email regarding my service request. Msg & data rates may apply."
    (checkbox must be checked to submit)

UX requirements:
  - Progress indicator showing current step
  - "Back" button on steps 2 and 3
  - Field validation on blur and on Next click
  - Form state persists if user goes back
  - Submit button shows loading spinner during submission
  - On success: show inline success message ("We'll call you shortly!") then
    redirect to /[niche]/[market]/thank-you after 2 seconds

On submit: POST to /api/leads/submit with all form data + marketId + variantId
```

**Claude Code Prompt — Lead Submission API:**
```
Create the form submission API route at app/api/leads/submit/route.ts.

It should:
1. Validate all required fields (Zod schema)
2. Rate limit: max 5 submissions per IP per hour using Upstash Redis
   (@upstash/ratelimit with sliding window). Return 429 if exceeded.
3. Check for duplicate phone within 30 days in the leads table.
   If duplicate found: update the existing lead's status and return success
   (don't create duplicate, don't tell the user)
4. Write to leads table with status="new"
5. Write TCPA consent to audit_log table with: actor_type="system",
   action="tcpa_consent_captured", metadata includes consent text hash,
   IP address, form version, timestamp
6. Trigger Inngest event "lead/submitted" with the lead ID
7. Return 200 with { success: true, leadId }

Handle errors gracefully — never expose internal errors to the consumer.
Log all errors to Sentry.
```

---

### Phase 2 — IVR System (Days 19-35)

**Goal:** All inbound calls automatically qualified and routed.

**Tasks:**
- [ ] apps/ivr Node.js service with Twilio webhook validation
- [ ] IVR state machine (full call flow from PRD Section 3.1)
- [ ] Redis session management for call state
- [ ] Live transfer with simultaneous ring logic
- [ ] Fallback routing when primary doesn't answer
- [ ] Voicemail recording with contractor SMS alert
- [ ] 90-second qualification timer
- [ ] Post-call: Deepgram transcription + Claude analysis
- [ ] Call + lead records updated throughout the flow

**Claude Code Prompt — IVR Service:**
```
Build the IVR service in apps/ivr as a Node.js Express application
with TypeScript.

Routes needed:
  POST /twilio/voice/inbound    — initial inbound call, return greeting TwiML
  POST /twilio/voice/gather     — handle DTMF/speech input from gather
  POST /twilio/voice/status     — call status update webhook
  POST /twilio/voice/recording  — recording complete callback
  GET  /health                  — health check

All Twilio webhook routes must validate the X-Twilio-Signature header
using twilio.validateRequest(). Return 403 if invalid.

Implement call session management in Upstash Redis:
  - Key: "call:session:{callSid}"
  - TTL: 30 minutes
  - Value: CallSession interface (state, marketId, zip, routingAttempt, etc.)
  - Helper functions: getSession(), updateSession(), clearSession()

On /twilio/voice/inbound:
  1. Look up market by the called phone number (toPhone)
  2. Create CallSession in Redis with state="GREETING"
  3. Create Call record in database
  4. Return TwiML: play greeting message, then <Gather> for DTMF input
     Action URL: /twilio/voice/gather

The Twilio number → market lookup should be cached in Redis with 5-minute TTL.
```

**Claude Code Prompt — IVR State Machine:**
```
Implement the IVR state machine in apps/ivr/src/call-flow.ts.

Implement all states from the PRD: GREETING, QUALIFICATION, ZIP_COLLECTION,
ROUTING, FALLBACK_ROUTING, VOICEMAIL, OUT_OF_AREA, GENERAL_INQUIRY.

Each state is a function: (session: CallSession, input: TwilioGatherInput) =>
{ twiml: string, nextState: IVRState, sessionUpdates: Partial<CallSession> }

State transition rules:
- GREETING: Press 1 → QUALIFICATION, Press 2 → GENERAL_INQUIRY,
  timeout → repeat greeting once → VOICEMAIL
- QUALIFICATION: collect zip code. Valid zip in market → ROUTING.
  Valid zip, not in market → OUT_OF_AREA. Invalid → repeat once → VOICEMAIL
- ROUTING: query database for contractors serving the zip, ordered by
  isPrimary DESC, priority ASC. Attempt Twilio <Dial> to primary contractor.
  Use /twilio/voice/status for dial callback. If no-answer → FALLBACK_ROUTING
- FALLBACK_ROUTING: try next contractor in order.
  If exhausted → VOICEMAIL
- VOICEMAIL: play message, record voicemail, trigger SMS notification to
  all contractors serving that zip via Twilio SMS

Log every state transition to call_routing_events table.

When a ROUTING connection succeeds (dial answered):
  - Note the connected timestamp
  - Start a 90-second timer in Redis: "call:qualify:{callSid}" with 90s TTL
  - When timer expires: fire Inngest event "call/qualified" with call details
```

**Claude Code Prompt — Post-Call Processing:**
```
Create the Inngest function onCallCompleted in apps/web/src/inngest/functions.ts.

This function is triggered by the Twilio call status webhook when a call ends.

Steps (each is a separate Inngest step for independent retry):

step 1 - fetchRecording:
  Wait for recording to be available (Twilio takes 30-60s).
  Use a sleep/retry pattern: check recording status, retry up to 5 times
  with 30-second delays.

step 2 - transcribeWithDeepgram:
  Send recording URL to Deepgram API for transcription.
  Use Deepgram's Nova-2 model.
  Store transcript on the Call record.

step 3 - analyzeWithClaude:
  Send transcript to Claude API (claude-sonnet-4-6) with this system prompt:
  "You analyze home service lead generation call transcripts.
   Extract the following as JSON:
   - jobType: the specific service requested
   - scopeEstimate: 'small'|'medium'|'large'
   - urgencyScore: 1-5
   - isActualLead: boolean (false if spam/solicitor/wrong number)
   - disputeRisk: 'low'|'medium'|'high'
   - summary: 1-2 sentence summary of the call
   - flags: array of notable observations"

step 4 - updateLeadRecord:
  Update lead with AI analysis results.
  If isActualLead=false: update lead.status="spam", do not bill.

step 5 - updateContractorMetrics:
  Recalculate answerRate for the contractor who received this call.
  Trigger recalculation of their reliabilityScore.

Use prompt caching on the Claude system prompt (it's called frequently).
```

---

### Phase 3 — Contractor Portal (Days 36-52)

**Goal:** Contractors can self-serve onboard, manage territories, and view calls.

**Tasks:**
- [ ] Contractor onboarding multi-step wizard
- [ ] Dashboard with key metrics
- [ ] Calls list with recording player and dispute flow
- [ ] Territory management with zip code configuration
- [ ] Operating hours configuration
- [ ] Billing panel (Stripe portal integration)
- [ ] Real-time notifications (Supabase Realtime for new call alerts)

**Claude Code Prompt — Contractor Onboarding:**
```
Build the contractor onboarding wizard at app/(contractor)/onboarding/page.tsx.

This is a multi-step wizard with these steps:

Step 1 — Company Info:
  Fields: companyName, contactName, phone, website (optional), licenseNumber,
  licenseState. "Upload proof of license/insurance" file upload (PDF or image,
  max 10MB, stored in Supabase Storage at path contractors/{userId}/license.pdf)

Step 2 — Service Configuration:
  Show available niches as cards with descriptions and average job values.
  Contractor selects which niches they service.
  Below niches: zip code entry field (type zip codes, see them added as chips).
  Or: "Upload a list" option (CSV with zip codes).

Step 3 — Territory Selection:
  Show a table of available markets matching the contractor's state + niches.
  Each row: market name, avg monthly calls, current rate, availability status.
  Contractor selects which markets they want access to.
  Show estimated monthly spend based on selection.

Step 4 — Billing Setup:
  Stripe Elements embedded payment form (card number, expiry, CVC).
  Show billing model for selected markets: per-call rate per niche.
  Terms of service with explicit "lead flow may be paused if payment fails"
  language. Checkbox acceptance required.

Step 5 — Confirmation:
  Summary of selections.
  Status: "Your application is under review. You'll hear from us within
  24 hours." (Account is status="pending" until admin approves)

Store progress in local state — if user refreshes, they resume at their
last completed step.
```

**Claude Code Prompt — Contractor Dashboard:**
```
Build the contractor dashboard at app/(contractor)/dashboard/page.tsx.

This is a server component that loads all data server-side.

Sections:

1. Stats bar (4 cards):
   - Calls this month: total received
   - Qualified calls: calls ≥ 90 seconds (billed)
   - This month's spend: sum of billing_transactions for current month
   - Answer rate: from contractor.answerRate

2. Recent calls table (last 10):
   Columns: Date, Time, Duration, Zip, Status badge (Qualified/Not Qualified/Disputed)
   Click row → navigate to /calls/[id]
   Each row has a small "Listen" button that opens inline audio player

3. Account status banner:
   - If contractor.status = "pending": yellow banner "Your account is under review"
   - If contractor.status = "paused": orange banner "Your lead flow is paused"
     with "Manage Billing" button
   - If contractor.status = "suspended": red banner "Your account is suspended.
     Contact support." with billing portal link
   - If all good: no banner

4. Quick actions:
   - "Pause my lead flow" toggle (updates ContractorMarket.isPaused via tRPC)
   - "Add territories" button → link to /territories
   - "View billing" button → link to /billing

Wire up Supabase Realtime to show a toast notification when a new
lead_assignment record is created for this contractor.
```

---

### Phase 4 — Billing Automation (Days 53-65)

**Goal:** All money movement is automated with zero manual intervention.

**Tasks:**
- [ ] Stripe Customer creation on contractor approval
- [ ] Per-call Payment Intent creation at 90-second mark
- [ ] Stripe Subscription for territory lease model
- [ ] Webhook handler for all Stripe events
- [ ] Failed payment cascade (pause → suspend → activate backup)
- [ ] Invoice PDF generation
- [ ] Monthly statement automation

**Claude Code Prompt — Billing Core:**
```
Implement Stripe billing in apps/web/src/lib/stripe.ts.

Create these functions:

createContractorCustomer(contractor: Contractor): Promise<string>
  Creates Stripe Customer, stores stripeCustomerId on contractor record.

savePaymentMethod(contractorId: string, paymentMethodId: string): Promise<void>
  Attaches payment method to Stripe Customer, sets as default.

chargeForQualifiedCall(params: {
  contractorId: string
  assignmentId: string
  amountCents: number
  callDescription: string
}): Promise<Stripe.PaymentIntent>
  Creates and immediately confirms a PaymentIntent using contractor's
  default payment method. On success: create BillingTransaction record
  with status="succeeded". On failure: create BillingTransaction with
  status="failed", trigger onPaymentFailed Inngest event.

createTerritoryLeaseSubscription(params: {
  contractorId: string
  marketId: string
  priceId: string
}): Promise<Stripe.Subscription>
  Creates Stripe Subscription. Stores stripeSubscriptionId on
  ContractorSubscription record.

createBillingPortalSession(contractorId: string): Promise<string>
  Creates Stripe Customer Portal session, returns URL.

All functions must be idempotent. Use Stripe idempotency keys based on
the relevant record ID.
```

**Claude Code Prompt — Stripe Webhook:**
```
Build the Stripe webhook handler at app/api/webhooks/stripe/route.ts.

Verify webhook signature using stripe.webhooks.constructEvent() with
STRIPE_WEBHOOK_SECRET. Return 400 if invalid.

Handle these events:

payment_intent.succeeded:
  Find BillingTransaction by stripePaymentIntentId.
  Update status to "succeeded".
  Send receipt email to contractor via Resend.

payment_intent.payment_failed:
  Find BillingTransaction, update status to "failed".
  Trigger Inngest "billing/payment-failed" event with contractorId.

customer.subscription.updated:
  Find ContractorSubscription by stripeSubscriptionId.
  Sync status field.
  If status changes to "past_due": trigger payment failure flow.

customer.subscription.deleted:
  Find ContractorSubscription, mark cancelled.
  Trigger Inngest "billing/subscription-cancelled" event.

invoice.payment_succeeded:
  Reset contractor.paymentFailures to 0.
  If contractor was paused due to payment: un-pause lead flow.

All handlers must be idempotent — check if event was already processed
by looking for existing records before taking action.
Log all events to AuditLog table.
```

**Claude Code Prompt — Payment Failure Cascade:**
```
Create the Inngest function onPaymentFailed in apps/web/src/inngest/functions.ts.

Input: { contractorId: string, failureCount: number }

step 1 - incrementFailureCount:
  Update contractor.paymentFailures += 1 in database.
  Fetch updated contractor with all ContractorMarket records.

step 2 - sendNotification:
  Always: send payment failure email via Resend with:
  - Specific amount that failed
  - Link to billing portal to update payment method
  - Clear warning about what happens if not resolved

step 3 - pauseIfThreshold:
  If paymentFailures >= 2:
    Set ALL contractor's ContractorMarket.isPaused = true
    Send "Your lead flow has been paused" email with urgency language
    Create AuditLog entry

step 4 - suspendIfCritical:
  If paymentFailures >= 3:
    Set contractor.status = "suspended"
    Find backup contractors for each of this contractor's markets
    Set backup contractors as primary (update ContractorMarket.isPrimary)
    Send "Your account has been suspended" email
    Notify admin via email
    Create AuditLog entry for each market affected

The "flip the switch" in step 4 must be atomic — use a Prisma transaction
to update all ContractorMarket records simultaneously.
```

---

### Phase 5 — Admin Dashboard (Days 66-78)

**Goal:** Full operator visibility and control from one interface.

**Tasks:**
- [ ] Overview dashboard with key metrics
- [ ] Market management: create, configure, deploy, monitor
- [ ] Contractor management: approve, monitor, manage
- [ ] Call pipeline with dispute resolution
- [ ] Revenue analytics with charts
- [ ] System health monitoring panel

**Claude Code Prompt — Admin Overview:**
```
Build the admin overview dashboard at app/(admin)/admin/dashboard/page.tsx.

This is a server component. Fetch all data server-side with Promise.all for
parallel queries.

Display:
1. KPI row (6 stats cards):
   - MRR (sum of active subscription amounts + this month's per-call charges)
   - Active markets count
   - Active contractors count
   - Calls today
   - Qualified calls today
   - Open disputes count (red if > 0)

2. Revenue chart: Recharts BarChart showing last 30 days revenue.
   Daily bars with a 7-day moving average line overlay.

3. Alerts panel (high priority items):
   - Payment failures in last 24h (with contractor names)
   - Disputes filed in last 24h (with dispute reason)
   - Contractors with answer rate < 50% in last 7 days
   - Markets with zero calls in last 7 days
   Each alert is a clickable row that navigates to the relevant record.

4. Top markets table: market name, calls this month, revenue this month,
   active contractors, qualified rate.

5. Recent activity feed: last 20 audit log entries with human-readable descriptions.
```

**Claude Code Prompt — Market Deployment:**
```
Build the market creation and deployment flow in the admin.

Create tRPC procedure adminMarkets.deployTemplate(marketId) that:
1. Validates market has required fields (name, slug, niche, heroHeadline,
   metaTitle, phoneNumber config)
2. Calls Twilio API to search for available local numbers in the market's
   area code (use market's state to determine area codes)
3. Purchases the first available number
4. Configures the number's voice webhook URL to point to the IVR service:
   "{IVR_SERVICE_URL}/twilio/voice/inbound"
5. Stores twilioNumberSid and phoneNumber on the Market record
6. Sets market.isActive = true
7. Triggers Next.js on-demand revalidation for the market's landing page path
8. Creates AuditLog entry
9. Sends admin notification email "Market [name] is now live"

Also create the "Add Market" form at app/(admin)/admin/markets/new/page.tsx
with all required fields including niche selection, sub-market configuration,
and contractor assignment. Preview the landing page before publishing.
```

---

### Phase 6 — Intelligence Layer (Days 79-88)

**Goal:** Data compounds — each call makes the system smarter.

**Tasks:**
- [ ] Contractor reliability score calculation (daily job)
- [ ] Market opportunity scoring for new market evaluation
- [ ] Call volume analytics (peak times, seasonal patterns)
- [ ] Market performance comparison
- [ ] Automated contractor performance alerts

**Claude Code Prompt — Reliability Score:**
```
Implement the contractor reliability score calculation in
packages/scoring/src/contractor-score.ts as a pure function.

Input:
  - calls: array of last 90 days calls for this contractor
  - transactions: array of last 90 days billing transactions
  - disputes: array of all disputes for this contractor

Output: { score: number (0-100), breakdown: ScoreBreakdown, flags: string[] }

Scoring formula:
  answerRate (40 points):
    % of routed calls answered within 4 rings
    100% = 40pts, 90% = 36pts, 80% = 28pts, 70% = 18pts, <60% = 0pts

  disputeRate inverse (30 points):
    0% disputes = 30pts, 5% = 25pts, 10% = 18pts, 20% = 8pts, >25% = 0pts

  paymentReliability (20 points):
    Zero payment failures in 90 days = 20pts
    1 failure (resolved) = 14pts, 2 failures = 6pts, 3+ = 0pts

  dataCompleteness (10 points):
    Has close rate data = 5pts, has license verified = 3pts, has website = 2pts

Flags:
  - "low_answer_rate" if answerRate < 70%
  - "high_dispute_rate" if disputeRate > 15%
  - "payment_risk" if paymentFailures >= 2
  - "new_contractor" if total calls < 10

Write comprehensive Jest tests for all scoring scenarios.
```

---

### Phase 7 — Scale Infrastructure (Days 89-100)

**Goal:** Deploy new markets in under 2 hours, manage 100+ assets with one person.

**Tasks:**
- [ ] Bulk market deployment from CSV
- [ ] Landing page A/B test automation (auto-promote winner)
- [ ] GBP post scheduling with Claude-generated content
- [ ] Market cloning (copy all settings from proven market to new geo)
- [ ] Contractor network expansion tools

**Claude Code Prompt — Market Cloning:**
```
Build a "Clone Market" feature in the admin. Given an existing successful
market as a template, create a new market in a different geography with
all settings copied.

Admin UI: at app/(admin)/admin/markets/[id]/clone/page.tsx

Form fields:
  - New market name
  - New market slug
  - Target state and city
  - Keep same niche: yes (auto-populated from source)
  - Sub-markets to create (add/remove rows, each with name + zip codes)
  - Which contractor to assign (dropdown of active contractors in target state,
    or "I'll assign later")

On submit, tRPC procedure adminMarkets.clone(sourceId, input) should:
1. Create new Market record copying: nicheId, templateId, heroHeadline,
   heroSubheadline, routingMode, and all pricing configs
2. Create SubMarket records for each sub-market in the form
3. Create PageVariant records copying the winning variant from source market
4. If contractor selected: create ContractorMarket assignment
5. Status = inactive (admin must manually deploy/activate)
6. Return new market ID

After creation, redirect to the new market's edit page with a banner:
"Market created. Review settings and click Deploy when ready."
```

---

## 14. Third-Party Setup Checklist

Complete all of these before writing Phase 0 code:

```
REQUIRED BEFORE PHASE 0:
  [ ] Supabase — create project, copy SUPABASE_URL + SUPABASE_ANON_KEY + SERVICE_ROLE_KEY
  [ ] Vercel — connect GitHub repo, configure environment variables
  [ ] Railway — create account for IVR service
  [ ] Upstash — create Redis database, copy REST URL + TOKEN
  [ ] Inngest — create account, copy EVENT_KEY + SIGNING_KEY

REQUIRED BEFORE PHASE 1 (landing pages):
  [ ] Twilio — create account, verify phone, copy ACCOUNT_SID + AUTH_TOKEN
  [ ] Twilio — purchase first tracking number manually for the test market
  [ ] PostHog — create account + project, copy PUBLIC_KEY
  [ ] Sentry — create two projects (web, ivr), copy DSNs

REQUIRED BEFORE PHASE 2 (IVR):
  [ ] Deepgram — sign up, copy API_KEY
  [ ] Anthropic — verify API access and rate limits, copy API_KEY

REQUIRED BEFORE PHASE 4 (billing):
  [ ] Stripe — create account, verify identity, copy SECRET_KEY + WEBHOOK_SECRET
  [ ] Stripe — create Products and Prices for per-call billing (each niche)
  [ ] Stripe — create Products and Prices for monthly territory leases
  [ ] Resend — create account, verify sending domain, copy API_KEY
```

---

## 15. Environment Variables

```bash
# Supabase
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...        # direct connection for migrations
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=                # default outbound number

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Deepgram
DEEPGRAM_API_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=dispatch@yourdomain.com

# IVR Service
IVR_SERVICE_URL=https://your-ivr.railway.app

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_EMAIL=you@yourdomain.com
```

---

## 16. Revenue Timeline

### Honest Assessment

Revenue depends on three variables you control: how fast you build,
how much you spend on traffic, and how quickly you close contractor partners.
The timeline below assumes: crawl space niche, Raleigh-Durham market,
$500-1,000/month initial ad spend, and active (not passive) contractor outreach.

---

### Month 1-2: Zero Revenue (Infrastructure + First Asset)

**What happens:**
- Phase 0 and Phase 1 complete (foundation + landing pages)
- First market deployed: one sub-market landing page live
- Google Business Profile created (not ranking yet — takes 60-90 days)
- Google LSA or search ads turned on for immediate traffic
- Calling contractors using the free-call script from the earlier analysis
- Goal: sign first paying contractor before revenue starts

**Revenue:** $0 (building)
**Spend:** $500-1,500 (setup, first month ads)

**Key milestone:** First contractor signs a per-call agreement.

---

### Month 3: First Revenue

**What happens:**
- IVR live (Phase 2 complete or near complete)
- First qualified calls routing to first contractor
- 8-15 inbound calls/month from paid traffic
- 4-8 qualify (≥ 90 seconds)
- 1-2 converted to paying leads (not all contractors pay immediately on
  the first calls — some need to see 2-3 free calls first)

**Revenue:** $400-1,200 (2-6 qualified calls × $200-250/call)
**Spend:** $600-1,000 (Google LSA/ads)
**Net:** -$200 to +$200

**This is expected.** You are validating, not profiting.

---

### Month 4-5: Break Even

**What happens:**
- Second sub-market deployed in Raleigh-Durham
- 15-25 calls/month total across 2 sub-markets
- 2 paying contractors (one per sub-market or one covering both)
- GBP listing starting to drive organic calls
- First contractor showing interest in monthly lease ($1,200-1,500/month)
  because they've seen consistent call quality

**Revenue:** $2,000-4,000/month
**Spend:** $800-1,200 (ads across 2 sub-markets)
**Net:** $800-2,800/month

**Key milestone:** First contractor upgrades to monthly territory lease.
This is the signal to expand aggressively.

---

### Month 6-8: Meaningful Revenue ($5k-10k/month)

**What happens:**
- 4-6 sub-markets live (Cary, Apex, Wake Forest, Durham, Morrisville, Chapel Hill)
- 3-5 paying contractors
- Mix: 2 monthly leases ($1,200-2,000 each) + 2 per-call contractors
- Organic GBP traffic starting to reduce ad dependency on first markets
- Phase 3 (contractor portal) live — less time managing contractors manually
- Consider deploying second metro (Charlotte NC or Greenville SC)

**Revenue:** $6,000-12,000/month
**Spend:** $2,000-3,500 (ads across multiple sub-markets)
**Net:** $4,000-8,500/month

---

### Month 10-14: Substantial Revenue ($20k-40k/month)

**What happens:**
- 2-3 metros fully built out (12-20 sub-market assets)
- 8-15 paying contractors
- 4-6 monthly territory leases generating $1,500-2,500 each
- Per-call revenue from non-leased markets
- System largely self-managing (contractor portal handles disputes, billing is automated)
- Considering second niche (Foundation Repair is the natural expansion)
- Hiring a part-time VA to handle GBP management and contractor onboarding support

**Revenue:** $18,000-40,000/month
**Spend:** $5,000-8,000 (ads) + $1,500 (VA) + $500 (infrastructure)
**Net:** $11,000-30,500/month

**This is "substantial revenue" — the 10-14 month range is realistic
for someone executing consistently, not casually.**

---

### Month 18-30: Empire Territory ($75k-150k/month)

**What happens:**
- 40-80 market assets across 6-12 metros
- 2-3 niches active
- 25-50 contractors in network
- Many assets generating organic traffic (GBP + SEO) with minimal ongoing ad spend
- Monthly lease model dominant (more predictable)
- Small team: 1 full-time ops person, 1 part-time developer for platform maintenance
- Platform intelligence: contractor scoring, routing optimization, market prediction

**Revenue:** $60,000-150,000+/month
**Spend:** $15,000-25,000 (ads on newer markets) + $8,000-12,000 (team)
**Net:** $35,000-115,000/month

---

### What Kills the Timeline (Honest)

1. **Not signing a contractor fast enough.** Build the asset, then immediately
   call contractors. Don't wait until the system is perfect. First calls should
   go out to contractors before the IVR is even built.

2. **Contractor doesn't close your leads.** If your contractor can't convert
   calls to jobs, they'll dispute everything and churn. Vet them before signing.
   Test with 2 free calls. Ask for references from their current customers.

3. **Google changes the rules.** LSA pricing goes up, GBP policies tighten,
   algorithm updates hurt rankings. Mitigation: multi-channel from month 1,
   never 100% dependent on any single traffic source.

4. **Undercapitalized traffic spend.** You cannot generate revenue without
   calls. You cannot get calls without traffic. $0 ad spend = $0 revenue
   while SEO builds. Minimum viable ad budget: $500/month per active sub-market.

5. **Building instead of selling.** The technology is a multiplier, not the
   product. The product is qualified calls. If you spend 3 months perfecting
   the contractor portal instead of signing contractors and running ads,
   you've delayed revenue by 3 months.

---

## 17. GHL vs. Custom Platform Decision

### Verified GHL Capabilities (Agency Pro Plan, $497/month)

Research confirmed exactly what GHL can and cannot do for this specific use case:

| Capability | GHL Verdict | Notes |
|---|---|---|
| IVR with multi-level branching | ✅ Native | "Gather Input On Call" action, DTMF collection |
| Simultaneous ring / fallback routing | ✅ Native | Up to 7 users, configurable timeout |
| Call recording | ✅ Native | Must be enabled in settings |
| Multi-location GBP management | ✅ Native | All locations in one inbox |
| Webhook integrations (AI scoring) | ✅ Native | Full webhook actions in workflows |
| White-label branding | ✅ Native | Agency Pro required |
| Duration-based billing trigger | ❌ Not native | No workflow trigger for call duration threshold |
| Territory routing by zip code | ❌ Not native | Needs Mapsly integration or custom API |
| External contractor portal | ❌ Not native | Can be built on top of GHL API |
| Automated per-call Stripe billing | ❌ Not native | Stripe action exists but no duration trigger |

**The three critical gaps in GHL** are exactly the things that create the business moat:
duration-based billing, territory management, and the contractor portal. These require
custom code regardless of whether you use GHL or build fully custom.

### Use GoHighLevel for Phase 1 (Months 1-4)

For the first market and first contractor, GHL handles 80% of what you need:
- Landing pages in GHL funnel builder
- Call tracking numbers (LC Phone, Twilio-based under the hood)
- IVR call flows with DTMF input (zip code collection works)
- Simultaneous ring and fallback routing to contractors (native)
- CRM pipeline to track leads
- GBP management across multiple listings
- Manual invoicing via Stripe or bank transfer

**The billing workaround for Phase 1:** GHL's webhook actions can send call
data to a simple external endpoint (100 lines of code) that checks duration and
fires a Stripe charge. This is not elegant but it works while you validate.

**GHL limitation you'll hit:** When you have 3+ contractors across multiple
markets, territory routing and billing become manual. That's when the custom
platform pays for itself.

### Migrate to Custom Platform at Phase 2+ (Months 4+)

Once you've validated the model ($3,000+/month from one market),
begin building the custom platform alongside your GHL operation.
Migrate markets one at a time as each phase completes.

The custom platform is not a prerequisite for revenue.
It is a prerequisite for scale.

---

## 18. Success Metrics

| Metric | Month 3 Target | Month 8 Target | Month 18 Target |
|---|---|---|---|
| Active market assets | 1-2 | 8-12 | 40-60 |
| Active contractors | 1-2 | 6-10 | 25-40 |
| Monthly qualified calls | 5-10 | 40-80 | 200-400 |
| Qualification rate | 40%+ | 50%+ | 55%+ |
| Contractor answer rate | 70%+ | 75%+ | 80%+ |
| Monthly revenue | $500-1,500 | $6k-12k | $60k-120k |
| Revenue from leases (% of total) | 0% | 30-40% | 60-70% |
| Cost per qualified call | $60-120 | $40-80 | $20-50 |
| Net margin | -10-20% | 50-65% | 65-75% |
