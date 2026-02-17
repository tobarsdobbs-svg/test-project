/**
 * Real estate investing education topic bank.
 * Each topic includes a title, category, target audience, and key points to cover.
 */

const TOPIC_CATEGORIES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  STRATEGY: 'strategy',
  FINANCE: 'finance',
  MARKET_ANALYSIS: 'market-analysis',
  LEGAL_TAX: 'legal-tax',
};

const TOPICS = [
  {
    id: 'rental-property-basics',
    title: 'Rental Property Investing for Beginners: Complete Guide',
    category: TOPIC_CATEGORIES.BEGINNER,
    audience: 'First-time real estate investors',
    keyPoints: [
      'What rental property investing is and how it works',
      'Cash flow vs appreciation strategies',
      'How to analyze a rental property deal',
      'The 1% rule and 50% rule explained',
      'Finding your first rental property',
      'Property management basics',
    ],
    tags: ['rental property', 'beginner', 'passive income', 'cash flow'],
  },
  {
    id: 'brrrr-method',
    title: 'The BRRRR Method Explained: Buy, Rehab, Rent, Refinance, Repeat',
    category: TOPIC_CATEGORIES.STRATEGY,
    audience: 'Intermediate investors looking to scale',
    keyPoints: [
      'What BRRRR stands for and how the strategy works',
      'Finding undervalued properties for BRRRR',
      'Estimating rehab costs accurately',
      'Working with hard money and conventional lenders',
      'The refinance step: getting your capital back',
      'Real-world BRRRR deal example with numbers',
    ],
    tags: ['BRRRR', 'strategy', 'rehab', 'refinance', 'scaling'],
  },
  {
    id: 'house-hacking',
    title: 'House Hacking: Live for Free While Building Wealth',
    category: TOPIC_CATEGORIES.BEGINNER,
    audience: 'Young professionals and first-time buyers',
    keyPoints: [
      'What house hacking is and why it works',
      'Duplex, triplex, and fourplex house hacking',
      'Room rental and ADU strategies',
      'FHA loans and low down payment options',
      'How to analyze a house hack deal',
      'Tax benefits of house hacking',
    ],
    tags: ['house hacking', 'beginner', 'FHA', 'low money down'],
  },
  {
    id: 'real-estate-financing',
    title: '7 Ways to Finance Your Real Estate Investments',
    category: TOPIC_CATEGORIES.FINANCE,
    audience: 'All levels of investors',
    keyPoints: [
      'Conventional mortgages for investors',
      'FHA and VA loans for house hackers',
      'Hard money loans for flips and BRRRR',
      'Private money lending',
      'Seller financing deals',
      'Home equity lines of credit (HELOC)',
      'Commercial loans and portfolio lenders',
    ],
    tags: ['financing', 'loans', 'mortgage', 'creative financing'],
  },
  {
    id: 'cap-rate-explained',
    title: 'Cap Rate Explained: How to Value Investment Properties',
    category: TOPIC_CATEGORIES.INTERMEDIATE,
    audience: 'Investors learning deal analysis',
    keyPoints: [
      'What capitalization rate means',
      'How to calculate cap rate',
      'What makes a good cap rate',
      'Cap rate vs cash-on-cash return',
      'When cap rate matters and when it does not',
      'Using cap rate to compare markets',
    ],
    tags: ['cap rate', 'deal analysis', 'valuation', 'metrics'],
  },
  {
    id: 'wholesaling-101',
    title: 'Real Estate Wholesaling for Beginners: No Money Needed',
    category: TOPIC_CATEGORIES.STRATEGY,
    audience: 'Aspiring investors with limited capital',
    keyPoints: [
      'What wholesaling is and how it works legally',
      'Finding motivated sellers',
      'Writing assignment contracts',
      'Building a buyers list',
      'Marketing strategies for wholesalers',
      'Common wholesaling mistakes to avoid',
    ],
    tags: ['wholesaling', 'no money down', 'beginner', 'contracts'],
  },
  {
    id: 'real-estate-tax-strategies',
    title: 'Real Estate Tax Strategies That Save Thousands',
    category: TOPIC_CATEGORIES.LEGAL_TAX,
    audience: 'Active real estate investors',
    keyPoints: [
      'Depreciation and how it shelters income',
      'Cost segregation studies explained',
      '1031 exchanges to defer capital gains',
      'Real estate professional status',
      'Pass-through deductions for rental owners',
      'Opportunity zones and tax incentives',
    ],
    tags: ['taxes', 'depreciation', '1031 exchange', 'tax strategy'],
  },
  {
    id: 'market-analysis',
    title: 'How to Analyze Any Real Estate Market in 30 Minutes',
    category: TOPIC_CATEGORIES.MARKET_ANALYSIS,
    audience: 'Investors evaluating new markets',
    keyPoints: [
      'Population and job growth trends',
      'Median home prices and rent-to-price ratios',
      'Landlord-friendly vs tenant-friendly states',
      'Crime rates and neighborhood analysis',
      'Supply and demand indicators',
      'Free tools and data sources for market research',
    ],
    tags: ['market analysis', 'research', 'data', 'location'],
  },
  {
    id: 'fix-and-flip',
    title: 'House Flipping 101: How to Flip Your First Property',
    category: TOPIC_CATEGORIES.STRATEGY,
    audience: 'Aspiring house flippers',
    keyPoints: [
      'How house flipping works and profit margins',
      'The 70% rule for calculating maximum offer',
      'Finding deals: MLS, auctions, wholesalers, off-market',
      'Building a reliable contractor team',
      'Scope of work and budget management',
      'Selling strategies and working with agents',
    ],
    tags: ['house flipping', 'fix and flip', 'rehab', 'ARV'],
  },
  {
    id: 'passive-income-reits',
    title: 'REITs Explained: Passive Real Estate Investing Without Landlording',
    category: TOPIC_CATEGORIES.BEGINNER,
    audience: 'Passive investors and stock market investors',
    keyPoints: [
      'What REITs are and how they work',
      'Public vs private REITs',
      'REIT dividend yields and total returns',
      'Sector-specific REITs (residential, commercial, healthcare)',
      'REITs vs physical real estate pros and cons',
      'How to start investing in REITs',
    ],
    tags: ['REITs', 'passive income', 'dividends', 'stock market'],
  },
  {
    id: 'multifamily-investing',
    title: 'Multifamily Investing: From Duplexes to Apartment Buildings',
    category: TOPIC_CATEGORIES.INTERMEDIATE,
    audience: 'Investors looking to scale beyond single-family',
    keyPoints: [
      'Why multifamily is the fastest path to scaling',
      'Small multifamily (2-4 units) vs large (5+ units)',
      'Underwriting a multifamily deal',
      'Value-add strategies to increase NOI',
      'Syndication and raising private capital',
      'Property management at scale',
    ],
    tags: ['multifamily', 'apartments', 'scaling', 'syndication'],
  },
  {
    id: 'creative-financing',
    title: 'Creative Financing: Buy Real Estate With Little or No Money Down',
    category: TOPIC_CATEGORIES.ADVANCED,
    audience: 'Experienced investors seeking creative strategies',
    keyPoints: [
      'Subject-to existing financing',
      'Lease options and rent-to-own',
      'Seller carryback financing',
      'Master lease agreements',
      'Joint ventures and equity partnerships',
      'Using self-directed IRAs for real estate',
    ],
    tags: ['creative financing', 'no money down', 'subject to', 'seller financing'],
  },
  {
    id: 'property-management-tips',
    title: '10 Property Management Tips Every Landlord Must Know',
    category: TOPIC_CATEGORIES.INTERMEDIATE,
    audience: 'Self-managing landlords',
    keyPoints: [
      'Tenant screening best practices',
      'Setting the right rental price',
      'Lease agreements and legal protections',
      'Handling maintenance requests efficiently',
      'When to hire a property manager',
      'Dealing with difficult tenants and evictions',
    ],
    tags: ['property management', 'landlord', 'tenants', 'management'],
  },
  {
    id: 'real-estate-mistakes',
    title: '10 Biggest Mistakes New Real Estate Investors Make',
    category: TOPIC_CATEGORIES.BEGINNER,
    audience: 'New and aspiring investors',
    keyPoints: [
      'Not running the numbers properly',
      'Underestimating repair and maintenance costs',
      'Skipping due diligence and inspections',
      'Over-leveraging and cash reserve mistakes',
      'Emotional buying instead of analytical investing',
      'Ignoring market fundamentals',
    ],
    tags: ['mistakes', 'beginner', 'tips', 'due diligence'],
  },
  {
    id: 'short-term-rentals',
    title: 'Airbnb Investing: Short-Term Rental Profits Explained',
    category: TOPIC_CATEGORIES.STRATEGY,
    audience: 'Investors interested in vacation rentals',
    keyPoints: [
      'Short-term vs long-term rental income comparison',
      'Regulations and zoning for short-term rentals',
      'Analyzing STR markets and seasonality',
      'Setting up and furnishing an Airbnb',
      'Pricing strategies and dynamic pricing tools',
      'Managing guest experience and reviews',
    ],
    tags: ['Airbnb', 'short-term rental', 'vacation rental', 'STR'],
  },
];

/**
 * Get all available topics.
 */
export function getAllTopics() {
  return TOPICS;
}

/**
 * Get a topic by ID.
 */
export function getTopicById(id) {
  return TOPICS.find((t) => t.id === id);
}

/**
 * Get topics by category.
 */
export function getTopicsByCategory(category) {
  return TOPICS.filter((t) => t.category === category);
}

/**
 * Get a random topic that hasn't been used recently.
 * @param {string[]} usedIds - Array of recently used topic IDs to exclude
 */
export function getRandomTopic(usedIds = []) {
  const available = TOPICS.filter((t) => !usedIds.includes(t.id));
  if (available.length === 0) return TOPICS[Math.floor(Math.random() * TOPICS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export { TOPIC_CATEGORIES };
export default TOPICS;
