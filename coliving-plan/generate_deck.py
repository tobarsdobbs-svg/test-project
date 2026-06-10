#!/usr/bin/env python3
"""Generate the 2026 Coliving Cashflow Academy marketing & operating plan deck."""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

NAVY = RGBColor(0x14, 0x30, 0x4A)
SAND = RGBColor(0xE0, 0xA4, 0x58)
INK = RGBColor(0x2B, 0x33, 0x3C)
GRAY = RGBColor(0x5A, 0x64, 0x6E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT = RGBColor(0xF4, 0xF1, 0xEB)

SW, SH = Inches(13.333), Inches(7.5)

prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]

slide_no = 0


def _footer(slide, label="2026 Coliving Cashflow Academy | Marketing & Operating Plan"):
    global slide_no
    slide_no += 1
    tb = slide.shapes.add_textbox(Inches(0.5), Inches(7.05), Inches(11.0), Inches(0.35))
    p = tb.text_frame.paragraphs[0]
    p.text = label
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY
    num = slide.shapes.add_textbox(Inches(12.4), Inches(7.05), Inches(0.7), Inches(0.35))
    p = num.text_frame.paragraphs[0]
    p.text = str(slide_no)
    p.alignment = PP_ALIGN.RIGHT
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY


def _bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def title_slide(title, subtitle):
    s = prs.slides.add_slide(BLANK)
    _bg(s, NAVY)
    bar = s.shapes.add_shape(1, Inches(0.9), Inches(3.4), Inches(2.2), Inches(0.06))
    bar.fill.solid(); bar.fill.fore_color.rgb = SAND; bar.line.fill.background()
    tb = s.shapes.add_textbox(Inches(0.9), Inches(2.0), Inches(11.5), Inches(1.4))
    p = tb.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(44); p.font.bold = True; p.font.color.rgb = WHITE
    sb = s.shapes.add_textbox(Inches(0.9), Inches(3.7), Inches(11.5), Inches(1.6))
    sb.text_frame.word_wrap = True
    p = sb.text_frame.paragraphs[0]
    p.text = subtitle
    p.font.size = Pt(20); p.font.color.rgb = RGBColor(0xC9, 0xD4, 0xDE)
    _footer(s)
    return s


def section_slide(kicker, title):
    s = prs.slides.add_slide(BLANK)
    _bg(s, NAVY)
    kb = s.shapes.add_textbox(Inches(0.9), Inches(2.5), Inches(11.5), Inches(0.5))
    p = kb.text_frame.paragraphs[0]
    p.text = kicker.upper()
    p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = SAND
    tb = s.shapes.add_textbox(Inches(0.9), Inches(3.0), Inches(11.5), Inches(1.8))
    tb.text_frame.word_wrap = True
    p = tb.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(40); p.font.bold = True; p.font.color.rgb = WHITE
    _footer(s)
    return s


def content_slide(title, kicker=None):
    s = prs.slides.add_slide(BLANK)
    _bg(s, WHITE)
    bar = s.shapes.add_shape(1, Inches(0), Inches(0), SW, Inches(0.18))
    bar.fill.solid(); bar.fill.fore_color.rgb = SAND; bar.line.fill.background()
    if kicker:
        kb = s.shapes.add_textbox(Inches(0.6), Inches(0.35), Inches(12.1), Inches(0.4))
        p = kb.text_frame.paragraphs[0]
        p.text = kicker.upper()
        p.font.size = Pt(12); p.font.bold = True; p.font.color.rgb = SAND
    tb = s.shapes.add_textbox(Inches(0.6), Inches(0.62), Inches(12.1), Inches(0.85))
    p = tb.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(30); p.font.bold = True; p.font.color.rgb = NAVY
    _footer(s)
    return s


def add_bullets(slide, items, left=0.6, top=1.7, width=12.1, height=5.1, size=16):
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    first = True
    for item in items:
        level, text = (item if isinstance(item, tuple) else (0, item))
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        bold = text.startswith("!")
        if bold:
            text = text[1:]
        p.text = ("•  " if level == 0 else "–  ") + text if not bold else text
        p.level = level
        p.font.size = Pt(size if level == 0 else size - 2)
        p.font.bold = bold
        p.font.color.rgb = NAVY if bold else INK
        p.space_after = Pt(7)
    return tb


def add_table(slide, rows, left=0.6, top=1.8, width=12.1, height=None, size=13, col_widths=None):
    nrows, ncols = len(rows), len(rows[0])
    height = height or min(0.55 * nrows, 5.0)
    shape = slide.shapes.add_table(nrows, ncols, Inches(left), Inches(top), Inches(width), Inches(height))
    table = shape.table
    if col_widths:
        total = sum(col_widths)
        for i, w in enumerate(col_widths):
            table.columns[i].width = Emu(int(Inches(width) * w / total))
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            cell = table.cell(r, c)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            cell.fill.fore_color.rgb = NAVY if r == 0 else (LIGHT if r % 2 == 0 else WHITE)
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = str(val)
            p.font.size = Pt(size)
            p.font.bold = r == 0
            p.font.color.rgb = WHITE if r == 0 else INK
    return table


def two_col(slide, left_title, left_items, right_title, right_items, size=15):
    for x, heading, items in ((0.6, left_title, left_items), (6.8, right_title, right_items)):
        hb = slide.shapes.add_textbox(Inches(x), Inches(1.65), Inches(5.9), Inches(0.45))
        p = hb.text_frame.paragraphs[0]
        p.text = heading
        p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = SAND
        add_bullets(slide, items, left=x, top=2.15, width=5.9, height=4.6, size=size)


# ---------------------------------------------------------------- 1. Title
title_slide(
    "2026 Coliving Cashflow Academy",
    "Marketing & Operating Plan  |  Coliving Real Estate Investing Education\n"
    "DIY On-Demand Program  +  Done-With-You Live Weekly Coaching",
)

# ---------------------------------------------------------------- 2. Agenda
s = content_slide("Agenda")
add_bullets(s, [
    "1.  Goal / Target",
    "2.  Lean Canvas Business Model",
    "3.  Unique Selling Proposition (USP)",
    "4.  Audience and Avatar",
    "5.  Product Features and Benefits",
    "6.  Branding",
    "7.  Customer Acquisition — Channels, Affiliates, Lead Gen, Funnels",
    "8.  Content Calendar & PR",
    "9.  Operating Cadence, KPIs & Compliance Guardrails",
    "10. New Initiatives & Recap",
    "Addendum: Supercharger Strategies & Achievable Results",
], size=18)

# ---------------------------------------------------------------- 3. OKR Goal
s = content_slide("2026 OKR Goal", "Goal / Target")
tb = s.shapes.add_textbox(Inches(0.6), Inches(1.6), Inches(12.1), Inches(1.1))
p = tb.text_frame.paragraphs[0]
p.text = "$6,240,000 Top Line Revenue"
p.font.size = Pt(40); p.font.bold = True; p.font.color.rgb = SAND
add_table(s, [
    ["Revenue Stream", "Units", "Price", "Revenue"],
    ["Done-With-You Coaching (live weekly coaching + full program access)", "420", "$7,500", "$3,150,000"],
    ["DIY On-Demand Program (self-paced)", "2,400", "$997", "$2,392,800"],
    ["Low-Ticket Starter Kit + order bumps", "7,000", "$67 avg", "$469,000"],
    ["Affiliate / partner revenue", "—", "—", "$228,200"],
], top=2.75, size=14, col_widths=[6, 1.2, 1.2, 1.6])
tb = s.shapes.add_textbox(Inches(0.6), Inches(5.6), Inches(12.1), Inches(0.9))
tb.text_frame.word_wrap = True
p = tb.text_frame.paragraphs[0]
p.text = ("Revenue model is anchored by the high-ticket DWY tier; DIY and low-ticket fund cold-traffic "
          "acquisition and feed ascension. Quarterly pacing: $1.56M/quarter, $120K/week blended.")
p.font.size = Pt(13); p.font.color.rgb = GRAY

# ---------------------------------------------------------------- 4. Lean Canvas
s = content_slide("Lean Canvas Business Model", "Business Model")
add_table(s, [
    ["Problem", "Solution", "USP", "Unfair Advantage", "Customer Segments"],
    ["Traditional rentals don't cash flow at today's rates and prices.\n"
     "Landlords can't make existing properties perform.\n"
     "Room-rental operators drown in zoning, setup, and tenant management.",
     "Coaching platform that teaches investors to convert ordinary houses into compliant coliving "
     "properties cash flowing 2–4x a normal rental.\n"
     "Key metrics: new students; DIY→DWY ascension; first room rented in 90 days; CAC.",
     "Turn one ordinary house into 2–4x the rent — without buying more property.\n"
     "High-level concept: the operating system for coliving investing.",
     "Founder operates a real coliving portfolio with verifiable numbers.\n"
     "Platform and proptech partnerships.\n"
     "Community of operating hosts, not just students.\n"
     "Channels: YouTube, Meta, Google, podcasts, Skool, email.",
     "Landlords whose rentals stopped cash flowing.\n"
     "W-2 professionals seeking yield from 1–2 properties.\n"
     "House hackers ready to systematize.\n"
     "Mission-driven investors (workforce housing)."],
], top=1.7, height=4.0, size=10)
tb = s.shapes.add_textbox(Inches(0.6), Inches(6.35), Inches(12.1), Inches(0.6))
tb.text_frame.word_wrap = True
p = tb.text_frame.paragraphs[0]
p.text = ("Cost structure: SaaS stack, coaching payroll, media spend, affiliate commissions, legal review.   |   "
          "Revenue streams: DWY enrollments, DIY tuition, low-ticket products, affiliate commissions.")
p.font.size = Pt(10); p.font.color.rgb = GRAY

# ---------------------------------------------------------------- 5. USP section
section_slide("Message and Positioning", "Unique Selling Proposition (USP)")

# ---------------------------------------------------------------- 6. USP
s = content_slide("Coliving Cashflow Academy USP", "USP")
tb = s.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(10.9), Inches(2.2))
tf = tb.text_frame; tf.word_wrap = True
p = tf.paragraphs[0]
p.text = "“Don’t buy more doors. Unlock the doors you already have.”"
p.font.size = Pt(32); p.font.bold = True; p.font.color.rgb = SAND; p.alignment = PP_ALIGN.CENTER
p2 = tf.add_paragraph()
p2.text = ("\nColiving Cashflow Academy helps everyday investors turn one house into 2–4x the cash flow "
           "through compliant, professionally run room-by-room rentals — with coaching at the level of "
           "help you actually need.")
p2.font.size = Pt(20); p2.font.color.rgb = INK; p2.alignment = PP_ALIGN.CENTER
add_bullets(s, [
    "!Positioning rule: all earnings language is framed as rent mechanics (market rent per room vs. "
    "whole-unit rent) — never personal income promises.",
], top=5.3, size=14)

# ---------------------------------------------------------------- 7. Audience section
section_slide("Customers", "Audience and Avatar")

# ---------------------------------------------------------------- 8. Avatar
s = content_slide("Student Avatar: “Cashflow Chris”", "Audience and Avatar")
add_bullets(s, [
    "30–50 years old, ~55% male / 45% female, college educated, household income $85–150K.",
    "Owns a primary home; roughly half already own one rental that underperforms.",
    "Lives in growth metros with strong room-rental demand: Atlanta, Houston, Dallas, Phoenix, "
    "Charlotte, Tampa, Indianapolis.",
    "Analytical and skeptical: wants spreadsheets, walkthroughs, and legal clarity — not hype.",
    "Time-constrained professional (tech, healthcare, skilled trades, ex-military); often researching "
    "with a spouse or partner as co-decision-maker.",
    "Motivated by cash flow that survives high interest rates, and by the affordable-housing impact "
    "of providing clean rooms at attainable rents.",
], size=17)

# ---------------------------------------------------------------- 9. Symbols/Virtues
s = content_slide("Symbols, Virtues, Vices and Heroes", "Audience and Avatar")
add_bullets(s, [
    "!Symbols:", (1, "Rent-roll screenshots, before/after room makeovers, paid-off HELOC, family "
    "vacations funded by cash flow, tidy operating dashboards."),
    "!Virtues:", (1, "Numeracy, patience, compliance, systems-building, family security, providing "
    "quality housing, financial independence over flash."),
    "!Vices (what they avoid):", (1, "Get-rich-quick hype, over-leverage, guru worship, analysis "
    "paralysis, quitting after one bad tenant experience."),
    "!Heroes:", (1, "Operators who show real numbers: BiggerPockets-style educators, Coach Carson–type "
    "frugal investors, local landlords with paid-off portfolios, founders solving housing affordability."),
], size=16)

# ---------------------------------------------------------------- 10. Goals and Values
s = content_slide("Goals and Values", "Audience and Avatar")
two_col(
    s,
    "Goals", [
        "Replace 50–100% of W-2 income with durable rental cash flow.",
        "Make the properties they already own actually perform.",
        "Launch a first coliving conversion within 90 days.",
        "Build a repeatable system — not a second job.",
        "Join a community of real operators to learn alongside.",
    ],
    "Values", [
        "Numbers over hype; proof over promises.",
        "Compliance and doing it right (zoning, leases, insurance).",
        "Time freedom and family security.",
        "Housing impact: quality rooms at attainable rents.",
        "Continuous learning and self-investment.",
    ],
)

# ---------------------------------------------------------------- 11. Demographics
s = content_slide("Demographics, Affinity Interests and Top Metros", "Audience and Avatar")
add_bullets(s, [
    "!Age and Gender:",
    (1, "Core 30–50 (≈70% of audience); ~55% male / 45% female."),
    "!Affinity Audiences:",
    (1, "Real estate investing, personal finance / FIRE, landlord & property management tools, "
        "home improvement / DIY, small-business owners."),
    "!Top Acquisition Metros:",
    (1, "1. Atlanta   2. Houston/Dallas   3. Phoenix   4. Charlotte   5. Tampa   6. Indianapolis"),
    (1, "Selection criteria: room-rental demand, landlord-friendly rules, price-to-rent ratios, "
        "and clear (or navigable) occupancy ordinances."),
], size=16)

# ---------------------------------------------------------------- 12. Browsing
s = content_slide("How They Research and Browse", "Audience and Avatar")
two_col(
    s,
    "Devices & Behavior", [
        "~60% mobile / 40% desktop; long-form research happens on desktop in the evening.",
        "Watches YouTube at 1.5–2x speed; saves videos to playlists before buying.",
        "Reads reviews and searches “[program name] + scam / review” before any purchase.",
        "Asks AI assistants (ChatGPT, Gemini, Claude) to analyze deals and compare programs.",
    ],
    "Implications", [
        "Long-form YouTube is the trust engine; shorts are discovery only.",
        "Own the review/comparison search results with honest content.",
        "Publish structured, citable data so AI assistants reference us (GEO).",
        "Mobile-first funnel pages; desktop-grade webinar experience.",
    ],
)

# ---------------------------------------------------------------- 13. Sources of info
s = content_slide("Sources of Information", "Audience and Avatar")
add_bullets(s, [
    "!YouTube: BiggerPockets, rent-by-the-room operator channels, Coach Carson–style educators, "
    "house-hacking creators.",
    "!Podcasts: BiggerPockets Real Estate, Real Estate Rookie, regional REI shows, personal-finance/FIRE pods.",
    "!Communities: Skool and Discord investing groups, BiggerPockets forums, r/realestateinvesting, "
    "local REIA meetups.",
    "!Platforms & tools: Room-rental marketplaces, mid-term rental platforms, landlord software blogs.",
    "!AI assistants: Deal analysis, market questions, “is rent-by-the-room legal in my city?”",
    "!Newsletters: REI and personal-finance newsletters; data-driven market reports.",
], size=16)

# ---------------------------------------------------------------- 14. Pain points
s = content_slide("Challenges and Pain Points", "Audience and Avatar")
add_bullets(s, [
    "“My rental barely breaks even” — current portfolio underperforms at today's rates.",
    "Zoning and occupancy fear: “Is renting by the room even legal in my city?”",
    "Tenant-conflict fear: “I don't want to referee roommates.”",
    "Setup uncertainty: furnishing costs, conversion scope, what to budget.",
    "Financing and insurance confusion for room-by-room operation.",
    "Analysis paralysis from contradictory free content.",
    "Time scarcity: needs systems and management playbooks, not more theory.",
    "Discouragement risk: expects results in 90 days or starts doubting the model.",
], size=16)

# ---------------------------------------------------------------- 15. Roles & objections
s = content_slide("Roles and Objections", "Audience and Avatar")
two_col(
    s,
    "Roles", [
        "Sole decision-maker up to ~$1,000 (Starter Kit, DIY tier).",
        "Spousal/partner sign-off expected at the $7,500 DWY tier.",
        "Sales assets include a “partner brief” PDF: the numbers, the time "
        "commitment, and the risk controls — built for the kitchen-table conversation.",
    ],
    "Objections (each gets a dedicated funnel asset)", [
        "“How is this different from free YouTube house-hacking content?”",
        "“Is this legal in my market?” → city compliance database.",
        "“Will my insurance and lender allow it?” → vendor rolodex + guides.",
        "“I don't have time to manage rooms.” → management systems module.",
        "“Why is there no income guarantee?” → compliant proof + refund terms.",
    ],
)

# ---------------------------------------------------------------- 16. Product section
section_slide("Offer Ladder", "Product Features and Benefits")

# ---------------------------------------------------------------- 17. Lead magnet
s = content_slide("Lead Magnet: Coliving Cashflow Calculator + eBook", "Features and Benefits  |  Free")
two_col(
    s,
    "Features", [
        "Free room-rent calculator: enter an address, get projected per-room vs. whole-unit rent.",
        "Companion eBook: “The 2–4x Rent Math” with embedded videos.",
        "City-by-city legality checklist (top 25 metros).",
        "5-day email mini-course onboarding.",
    ],
    "Benefits", [
        "Know in one weekend whether coliving works for your address and market.",
        "Free value up front; builds trust before any pitch.",
        "GOAL: capture leads, then ascend to Starter Kit and DIY program.",
    ],
)

# ---------------------------------------------------------------- 18. Starter kit
s = content_slide("Coliving Starter Kit (Low Ticket)", "Features and Benefits  |  $47–$97")
two_col(
    s,
    "Features", [
        "10-video mini-course: the coliving model end to end.",
        "Room-Rent Comp Calculator (full version).",
        "Furnishing budget worksheet + house-rules starter template.",
        "Order bumps: lease addenda pack, screening checklist.",
        "Lifetime access.",
    ],
    "Benefits", [
        "Validate the model on your own property before investing further.",
        "Self-liquidating front-end: funds cold-traffic acquisition.",
        "Qualifies buyers for ascension into the DIY program.",
    ],
)

# ---------------------------------------------------------------- 19. DIY
s = content_slide("DIY On-Demand: “Coliving Operating System”", "Features and Benefits  |  $997")
two_col(
    s,
    "Features", [
        "8-week self-paced curriculum, 70+ step-by-step videos.",
        "Modules: deal analysis, zoning & occupancy compliance, conversion & furnishing playbook, "
        "room pricing, tenant screening & house rules, management systems.",
        "Downloadable lease addenda, house-rules templates, budget sheets.",
        "Community access + monthly recorded Q&A.",
        "Lifetime access including content updates.",
    ],
    "Benefits", [
        "Everything needed to launch a first coliving property on your own timeline.",
        "Templates remove legal guesswork and setup paralysis.",
        "Community provides real operator answers between launches.",
        "Natural upgrade path to DWY when hands-on help is wanted.",
    ],
)

# ---------------------------------------------------------------- 20. DWY
s = content_slide("Done-With-You: “Coliving Accelerator”", "Features and Benefits  |  $7,500 • 12 months")
two_col(
    s,
    "Features", [
        "Everything in the DIY program, plus:",
        "Live weekly group coaching — separate acquisitions call and operations call.",
        "Deal-review desk: submit a property, receive a recorded analysis within 48 hours.",
        "1:1 onboarding session and a personalized 90-day launch plan.",
        "City-specific compliance review checklist.",
        "Vendor, lender, and insurance rolodex.",
        "Private DWY-only community tier.",
    ],
    "Benefits", [
        "Your first conversion is reviewed at every step by people operating coliving "
        "properties today.",
        "Speed and de-risking — not just information.",
        "Accountability cadence keeps the 90-day launch on track.",
        "Spouse-ready ROI story: one converted property can return the tuition in "
        "year-one incremental rent (results vary by market and execution).",
    ],
)

# ---------------------------------------------------------------- 21. Ascension ladder
s = content_slide("Offer Ladder and Ascension Logic", "Features and Benefits")
add_table(s, [
    ["Tier", "Price", "Role in the Business", "Ascends To"],
    ["Lead Magnet (calculator + eBook)", "Free", "Capture demand; demonstrate the math", "Starter Kit / DIY"],
    ["Coliving Starter Kit", "$47–$97", "Self-liquidate ad spend; qualify buyers", "DIY program"],
    ["DIY Coliving Operating System", "$997", "Core volume product; community growth", "DWY Accelerator"],
    ["DWY Coliving Accelerator", "$7,500", "Profit anchor; success stories engine", "Alumni mastermind (2027)"],
], top=1.9, size=14, col_widths=[3.2, 1.1, 4.4, 2.4])
add_bullets(s, [
    "!Upsell driver is level of help, not more content. Target DIY→DWY ascension: 8% in-year.",
], top=4.95, size=14)

# ---------------------------------------------------------------- 22. Branding section
section_slide("Brand Foundation", "Branding")

# ---------------------------------------------------------------- 23. Brand pillars
s = content_slide("Brand Pillars and Visual Identity", "Branding")
two_col(
    s,
    "Brand Pillars", [
        "Calm: no hype, no urgency theatrics, no rented exotics.",
        "Numerate: every claim ships with a spreadsheet or walkthrough.",
        "Operator-credible: founder's real portfolio on camera, numbers shown.",
        "Impact-aware: coliving as a workforce-housing solution.",
    ],
    "Visual Identity", [
        "Warm residential photography: real rooms, real common spaces.",
        "Data-visualization accents: rent comparisons, dashboards.",
        "Palette: deep navy + warm sand; clean editorial type.",
        "Consistency system across site, course portal, ads, and social.",
    ],
)

# ---------------------------------------------------------------- 24. Acquisition section
section_slide("Channels, Affiliates, Lead Gen and Funnels", "Customer Acquisition")

# ---------------------------------------------------------------- 25. Paid mix
s = content_slide("Paid Channel Allocation and ROAS Targets", "Customer Acquisition  |  Media Buying")
add_table(s, [
    ["Channel", "Budget Share", "Primary Job", "ROAS Goal"],
    ["YouTube + Google Search", "45%", "High-intent demand capture; long-form trust for DWY", "3.0x"],
    ["Meta (Facebook / Instagram)", "35%", "Lead magnet + Starter Kit volume; retargeting", "2.3x"],
    ["Podcast & newsletter sponsorships", "15%", "Borrowed trust with REI audiences", "3.3x"],
    ["TikTok (experimental)", "5%", "Discovery test; must clear 1.5x gate to scale", "1.5x gate"],
], top=1.9, size=14, col_widths=[3.4, 1.4, 5.0, 1.5])
add_bullets(s, [
    "!Budget rebalances quarterly toward the best blended-CAC channel; no channel exceeds 50%.",
], top=4.7, size=14)

# ---------------------------------------------------------------- 26. Paid performance
s = content_slide("Paid Channel Performance Targets", "Customer Acquisition  |  Media Buying")
add_table(s, [
    ["Metric", "YouTube/Google", "Meta FB/IG", "Sponsorships"],
    ["Cost per lead (magnet)", "$12", "$9", "$15 effective"],
    ["Cost per booked DWY call", "$450", "$550", "$400"],
    ["Application → call show rate", "70%", "65%", "75%"],
    ["Call → close rate", "30%", "27%", "32%"],
    ["Blended cost per new customer", "$2,600", "$3,000", "$2,400"],
    ["Average order value (anchor)", "$7,500 DWY", "$997 DIY-led", "$7,500 DWY"],
], top=1.85, size=13, col_widths=[3.4, 2.4, 2.4, 2.4])
add_bullets(s, [
    "!UTM-to-CRM attribution on every lead: source → campaign → ad set → creative, "
    "joined to closed revenue for true ROAS by creative.",
], top=5.9, size=13)

# ---------------------------------------------------------------- 27. Organic mix
s = content_slide("Organic Channel Mix", "Customer Acquisition")
add_bullets(s, [
    "!YouTube channel (flagship): weekly property-walkthrough and deal-breakdown videos with real numbers; "
    "shorts cut from every long-form.",
    "!Free Skool community: nurture engine; weekly free live class; soft path to DIY and DWY.",
    "!SEO + GEO: programmatic city pages (“Is rent-by-the-room legal in {city}?”) structured for "
    "AI-assistant citation; calculator as the click-through hook.",
    "!Instagram / Facebook: student proof, behind-the-scenes operations, retargeting fodder.",
    "!Founder podcast guesting: target 40 shows in 2026.",
    "!Email newsletter: weekly rent-per-room data insight + one student story.",
], size=15)

# ---------------------------------------------------------------- 28. Affiliate overview
s = content_slide("Affiliate Overview — The “Army” Strategy", "Customer Acquisition  |  Affiliates")
add_bullets(s, [
    "Rather than relying on a few large affiliates to drive hundreds of sales, we recruit a wide army of "
    "smaller partners each expected to drive a handful of sales.",
    "Example math: 100 affiliates × 3 DIY sales × $997 ≈ $300K, plus DWY referrals at a "
    "$500 flat bounty per enrollment.",
    "Two partner categories: businesses (proptech, services) and individuals (creators, community leaders, "
    "successful students).",
    "Rock-star affiliates get launch-week incentives and co-created content; the long tail gets swipe "
    "files, tracking links, and a monthly affiliate newsletter.",
    "!Every affiliate signs an earnings-claims compliance addendum and uses pre-approved claims language.",
], size=15)

# ---------------------------------------------------------------- 29. Affiliate revenue
s = content_slide("Affiliate Revenue Goals", "Customer Acquisition  |  Affiliates")
tb = s.shapes.add_textbox(Inches(0.6), Inches(1.6), Inches(12.1), Inches(0.6))
p = tb.text_frame.paragraphs[0]
p.text = "2026 affiliate revenue goal: $228,200 (≈5% of program revenue)"
p.font.size = Pt(20); p.font.bold = True; p.font.color.rgb = NAVY
add_table(s, [
    ["", "Q1", "Q2", "Q3", "Q4"],
    ["Quarterly", "$57,050", "$57,050", "$57,050", "$57,050"],
    ["Monthly", "$19,017", "$19,017", "$19,017", "$19,017"],
    ["Weekly", "$4,389", "$4,389", "$4,389", "$4,389"],
], top=2.35, size=14, col_widths=[2.0, 2.2, 2.2, 2.2, 2.2])
add_bullets(s, [
    "Split: internal partner commissions ~35% • external affiliate-driven sales ~35% • "
    "cross-promotions ~30%.",
    "Quarterly promo calendar: one external affiliate push per month (Starter Kit), internal tool promos "
    "ongoing, one cross-promo partner per quarter.",
], top=4.85, size=14)

# ---------------------------------------------------------------- 30. Affiliate partners
s = content_slide("Affiliate Partners and Commissions", "Customer Acquisition  |  Affiliates")
two_col(
    s,
    "External (they promote us)", [
        "REI YouTubers & newsletter writers (Tier 1): 40% on DIY; $500 flat per DWY enrollment.",
        "Community promoters & successful students (Tier 2): 25% on DIY.",
        "Tier upgrades earned by volume and content quality.",
    ],
    "Internal (tools we teach with, paying us)", [
        "Room-rental platform host referrals.",
        "Property management / room-management software.",
        "Furnishing and turnkey setup partners.",
        "Landlord insurance brokers; tenant-screening services.",
        "Banking, bookkeeping, and entity-setup services.",
    ],
)

# ---------------------------------------------------------------- 31. Funnels
s = content_slide("Funnel Structures", "Customer Acquisition  |  Lead Gen")
add_table(s, [
    ["#", "Funnel", "Path", "Key Conversion Targets"],
    ["1", "DWY Application Funnel", "YouTube/podcast → free training → application → call → enroll",
     "25% application→call • 30% call→close"],
    ["2", "DIY Funnel", "Lead magnet → 5-day email mini-course → $997 offer (+ payment plan downsell)",
     "3.5% lead→sale in 30 days"],
    ["3", "Starter Kit Funnel", "Cold Meta traffic → $47–$97 offer + order bumps", "Self-liquidating (≥1.0x day-30)"],
    ["4", "Community Funnel", "Free Skool tier → weekly live class → DIY/DWY", "4% member→customer/quarter"],
    ["5", "Organic Site", "City legality pages + calculator → email capture", "12% visitor→lead"],
], top=1.85, size=12.5, col_widths=[0.5, 2.3, 5.6, 3.0])

# ---------------------------------------------------------------- 32. PR & content
s = content_slide("PR Goal & Content Calendar", "PR & Content")
two_col(
    s,
    "PR Objective: own “coliving investing” as a category", [
        "KR1: 40 podcast/YouTube collaborations in 2026.",
        "KR2: YouTube to 100K subscribers; 1M long-form watch-hours.",
        "KR3: 2 mainstream press placements on the workforce-housing angle.",
        "Monthly: rent-per-room index by metro — a citable data report for press and AI search.",
    ],
    "Weekly Content Cadence", [
        "1 long-form YouTube: deal breakdown or student property tour.",
        "3 shorts/reels cut from the long-form.",
        "1 newsletter: data insight + one student story.",
        "1 free live class in the community.",
        "2 student-win posts with compliant framing (documented, “results vary”).",
    ],
)

# ---------------------------------------------------------------- 33. New initiatives
s = content_slide("New Initiatives", "Get Excited")
add_bullets(s, [
    "!AI Deal-Analyzer Assistant: students upload a listing, receive a coliving pro-forma — retention "
    "feature and demo-able marketing hook.",
    "!Verified Student Results Registry: opt-in, documented before/after rent numbers; the compliant "
    "proof engine for all advertising.",
    "!City Compliance Database: the #1 objection becomes our owned, defensible asset.",
    "!Partner/Spouse Brief: kitchen-table PDF that closes the DWY second decision-maker.",
    "!Alumni Operator Mastermind ($15K tier): launches once 100+ DWY students operate properties — "
    "the 2027 revenue layer.",
], size=16)

# ---------------------------------------------------------------- 34. Operating cadence
s = content_slide("Operating Cadence and KPI Dashboard", "Operations")
add_table(s, [
    ["Cadence", "Review", "Owner"],
    ["Daily", "Ad spend vs. CAC guardrails; lead volume; call bookings", "Media buyer"],
    ["Weekly", "Funnel conversion by stage; show rate; close rate; affiliate sales; content shipped", "Marketing lead"],
    ["Monthly", "Blended CAC vs. LTV; DIY→DWY ascension; student success rate (first room rented in 90 days); churn", "GM"],
    ["Quarterly", "Channel rebalance; pricing review; offer tests; OKR scoring", "Founder + GM"],
], top=1.85, size=13, col_widths=[1.6, 7.5, 2.0])
add_bullets(s, [
    "!North-star metric: students with first room rented within 90 days. Student success drives "
    "referrals, proof, and ascension — it is the marketing engine.",
], top=4.95, size=14)

# ---------------------------------------------------------------- 35. Compliance
s = content_slide("Risk and Compliance Guardrails", "Operations")
add_bullets(s, [
    "!Earnings claims: all marketing uses rent-mechanics framing and documented student results with "
    "“results vary” disclosure; legal review of every funnel asset and ad batch.",
    "!Messaging: no cold SMS. Email + retargeting + community for nurture; any SMS is single-opt-in "
    "transactional (call reminders) on registered traffic.",
    "!Affiliates: signed compliance addendum; pre-approved claims library; spot audits quarterly.",
    "!Curriculum: zoning/occupancy taught as a first-class module; city database maintained by counsel-"
    "reviewed process.",
    "!Refund policy: clear, published terms — a trust asset, not fine print.",
    "!Platform risk: no channel over 50% of paid budget; owned email list and community are the moat.",
], size=15)

# ---------------------------------------------------------------- 36. Recap
s = content_slide("Recap: Coliving Cashflow Academy 2026")
add_bullets(s, [
    "!Goal: $6,240,000 top-line revenue, anchored by the $7,500 DWY Coliving Accelerator.",
    "Offer ladder: free calculator → $47–$97 Starter Kit → $997 DIY program → $7,500 DWY "
    "coaching → 2027 alumni mastermind.",
    "Acquisition: YouTube/Google-led (45%), Meta (35%), sponsorships (15%), TikTok test (5%); "
    "organic flywheel through YouTube, Skool community, and GEO city pages.",
    "Affiliate army: many partners × few sales each; $228K goal with compliance built in.",
    "Operations: weekly funnel reviews, quarterly channel rebalancing, student success (first room "
    "rented in 90 days) as the north-star metric.",
    "Brand: calm, numerate, operator-credible — proof over promises.",
], size=16)

# ---------------------------------------------------------------- 37. Addendum section
section_slide("Addendum", "Supercharger Strategies & Achievable Results")

# ---------------------------------------------------------------- 38. Superchargers 1-3
s = content_slide("Supercharger Strategies (1–3)", "Addendum")
add_bullets(s, [
    "!1. Joint-Venture Launch Circuit — projected +$1.2M",
    (1, "Four launch windows per year, each with 3 aligned partners (REI educators, proptech platforms, "
        "large newsletters) running co-hosted webinars to their lists. 12 JV webinars × ~400 attendees "
        "× 4% DWY application rate at standard close rates."),
    "!2. Quarterly “Coliving Launch Weekend” virtual event — projected +$900K",
    (1, "$97 ticket, 2-day implementation event (analyze a real deal live, build your 90-day plan). "
        "1,500 attendees/quarter; ticket revenue covers production; 3% DWY conversion + DIY bundle upsell."),
    "!3. Founder YouTube Flywheel at 2x cadence — projected +$700K",
    (1, "Two long-forms weekly plus a monthly “portfolio P&L on camera” series. Organic DWY "
        "applications compound: channel-attributed enrollments at near-zero CAC improve blended ROAS "
        "and fund more paid scale."),
], size=14)

# ---------------------------------------------------------------- 39. Superchargers 4-6
s = content_slide("Supercharger Strategies (4–6)", "Addendum")
add_bullets(s, [
    "!4. Student Referral Engine — projected +$350K",
    (1, "$500 credit or cash per referred DWY enrollment; automated ask at each student milestone "
        "(first room rented, first property converted). Success-based, near-zero CAC."),
    "!5. GEO City-Page Moat at scale — projected +$300K",
    (1, "Expand from 25 to 150 city legality pages with structured data and monthly rent-per-room index. "
        "Becomes the cited source in AI answers and search for “is rent-by-the-room legal in {city}” "
        "— durable, compounding lead flow."),
    "!6. Book + Self-Liquidating Offer + Paid Newsletter — projected +$250K",
    (1, "$9.97 book funnel (“The Coliving Cashflow Method”) feeding the ascension ladder, plus a "
        "$15/mo premium data newsletter (metro rent-per-room reports) that monetizes non-buyers and "
        "warms future DWY students."),
], size=14)

# ---------------------------------------------------------------- 40. Achievable results
s = content_slide("Achievable Results: Base vs. Supercharged", "Addendum")
add_table(s, [
    ["Scenario", "Revenue", "DWY Students", "DIY Students", "Blended CAC", "Assumption Level"],
    ["Base plan (this deck)", "$6.24M", "420", "2,400", "$2,400–3,000", "Targets hit at stated rates"],
    ["Base + Superchargers (conservative)", "$8.5M", "~620", "~3,200", "improves ~15%", "4 of 6 levers at 70% of projection"],
    ["Base + Superchargers (full execution)", "$9.9M", "~760", "~3,800", "improves ~25%", "All 6 levers at projection"],
], top=1.9, size=12.5, col_widths=[3.2, 1.3, 1.6, 1.6, 1.8, 2.6])
add_bullets(s, [
    "!Why the levers compound: JV launches and the event create demand spikes; the referral engine and "
    "YouTube flywheel lower blended CAC; lower CAC funds more paid spend at the same ROAS guardrails.",
    "!Conditions: results assume the stated conversion rates, a staffed coaching and sales team, and "
    "12 months of consistent execution. These are projections, not guarantees — actual results depend "
    "on execution, market conditions, and compliance with all advertising standards.",
], top=4.35, size=12.5)

prs.save("/home/user/test-project/coliving-plan/Coliving_Cashflow_Academy_2026_Plan.pptx")
print(f"Saved deck with {slide_no} slides.")
