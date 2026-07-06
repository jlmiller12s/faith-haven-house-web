/**
 * Faith Haven House - Resource Library Data
 * 
 * NOTE FOR FUTURE CONTENT UPDATES:
 * To add real resource links, documents, or partner contacts, locate the relevant
 * category below and add items to its `resources` array using the following schema:
 * 
 * {
 *   id: "unique-id",
 *   title: "Resource Title",
 *   type: "Guide" | "Directory" | "Download" | "Referral" | "Tool",
 *   description: "Brief summary of how this resource helps residents or families.",
 *   url: "https://external-link.org" or "/downloads/file.pdf",
 *   isExternal: true | false,
 *   comingSoon: false
 * }
 */

export const RESOURCE_CATEGORIES = [
  {
    title: "Financial Literacy",
    slug: "financial-literacy",
    description: "Budgeting, credit management, savings strategies, and personal financial management tools.",
    resources: [
      {
        id: "fin-1",
        title: "Coming Soon: Resident Budgeting Worksheets",
        type: "Download",
        description: "Step-by-step monthly budget planning template designed for transitional living income tracking.",
        comingSoon: true,
      },
      {
        id: "fin-2",
        title: "Coming Soon: Bank Account Opening Guide",
        type: "Resource Guide",
        description: "Checklist of required documentation to open low-fee checking and savings accounts locally.",
        comingSoon: true,
      },
      {
        id: "fin-3",
        title: "Coming Soon: Financial Wellness Workshops",
        type: "Schedule",
        description: "Monthly workshop schedule covering debt reduction, emergency savings, and wage management.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Credit Building",
    slug: "credit-building",
    description: "Tools, credit report review guidance, and action steps for repairing and establishing credit history.",
    resources: [
      {
        id: "cred-1",
        title: "Coming Soon: Credit Report Dispute Checklist",
        type: "Resource Guide",
        description: "How to request free annual credit reports and dispute incorrect reporting entries.",
        comingSoon: true,
      },
      {
        id: "cred-2",
        title: "Coming Soon: Secured Credit Card Partner Directory",
        type: "Local Partner Directory",
        description: "Vetted local credit unions offering zero-fee secured credit cards for rebuilding history.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Housing Readiness",
    slug: "housing-readiness",
    description: "Preparation resources, lease agreement fundamentals, landlord communication, and path to independent living.",
    resources: [
      {
        id: "house-1",
        title: "Coming Soon: Tenant Rights & Lease Agreement Guide",
        type: "Resource Guide",
        description: "Essential knowledge on lease contracts, security deposits, and tenant responsibilities in Missouri.",
        comingSoon: true,
      },
      {
        id: "house-2",
        title: "Coming Soon: Housing Application Portfolio Checklist",
        type: "Download",
        description: "Document folder organization checklist required by property managers and landlord partners.",
        comingSoon: true,
      },
      {
        id: "house-3",
        title: "Coming Soon: St. Charles Housing Authority Connection",
        type: "Local Partner Directory",
        description: "Information on Section 8 voucher queues, housing authority contacts, and local subsidies.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Job Readiness",
    slug: "job-readiness",
    description: "Employment search strategies, professional resume building, interview coaching, and workplace attire support.",
    resources: [
      {
        id: "job-1",
        title: "Coming Soon: Resume & Cover Letter Template Pack",
        type: "Download",
        description: "Clean, professional resume templates tailored for addressing employment history gaps.",
        comingSoon: true,
      },
      {
        id: "job-2",
        title: "Coming Soon: Local Second-Chance Employer List",
        type: "Local Partner Directory",
        description: "Directory of local businesses actively offering fair-chance hiring opportunities.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "ID Documents",
    slug: "id-documents",
    description: "Guidance for securing State IDs, Driver's Licenses, Social Security cards, and vital birth certificates.",
    resources: [
      {
        id: "id-1",
        title: "Coming Soon: Missouri State ID & Driver License Checklist",
        type: "Resource Guide",
        description: "Step-by-step required proof of identity, residency, and fee waiver information.",
        comingSoon: true,
      },
      {
        id: "id-2",
        title: "Coming Soon: Birth Certificate Replacement Guide",
        type: "Resource Guide",
        description: "Instructions for requesting out-of-state or local Missouri certified birth certificates.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Transportation",
    slug: "transportation",
    description: "Transit maps, bus pass assistance pathways, ride coordination, and regional mobility options.",
    resources: [
      {
        id: "trans-1",
        title: "Coming Soon: SCAT & Local Bus Schedule Directory",
        type: "Directory",
        description: "St. Charles Area Transit routes, stop schedules, and regional connector maps.",
        comingSoon: true,
      },
      {
        id: "trans-2",
        title: "Coming Soon: Bus Pass & Transit Token Request Guide",
        type: "Resource Guide",
        description: "How enrolled residents access subsidized monthly transit passes for work commutes.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Mental Health",
    slug: "mental-health",
    description: "Support pathways, community counseling connections, stress reduction, and crisis hotline resources.",
    resources: [
      {
        id: "mh-1",
        title: "Coming Soon: Community Counseling Partner List",
        type: "Local Partner Directory",
        description: "Sliding-scale and free mental health counseling services available in St. Charles County.",
        comingSoon: true,
      },
      {
        id: "mh-2",
        title: "Coming Soon: 988 Suicide & Crisis Lifeline Information",
        type: "Resource Guide",
        description: "24/7 confidential support resources for individuals experiencing emotional distress.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Recovery Referrals",
    slug: "recovery-referrals",
    description: "Referral pathways, 12-step support group listings, relapse prevention, and sober living connections.",
    resources: [
      {
        id: "rec-1",
        title: "Coming Soon: Local AA & NA Meeting Schedule",
        type: "Directory",
        description: "Weekly meeting directory for Alcoholics Anonymous and Narcotics Anonymous in St. Peters & St. Charles.",
        comingSoon: true,
      },
      {
        id: "rec-2",
        title: "Coming Soon: Celebrate Recovery Group Directory",
        type: "Directory",
        description: "Faith-centered 12-step recovery group meetings hosted by local church partners.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Bible Studies",
    slug: "bible-studies",
    description: "Faith-centered growth materials, scripture encouragement guides, and church partner study groups.",
    resources: [
      {
        id: "bib-1",
        title: "Coming Soon: Weekly Resident Scripture Study Guide",
        type: "Download",
        description: "Encouragement devotional studies focused on perseverance, hope, and spiritual renewal.",
        comingSoon: true,
      },
      {
        id: "bib-2",
        title: "Coming Soon: Partner Church Directory",
        type: "Local Partner Directory",
        description: "Local welcoming church congregations offering transportation and men's fellowship groups.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Life Coaching",
    slug: "life-coaching",
    description: "Goal setting frameworks, personal accountability guidance, mentorship connections, and life skills training.",
    resources: [
      {
        id: "lc-1",
        title: "Coming Soon: Personal Development Action Plan",
        type: "Download",
        description: "Interactive goal setting template covering 30, 60, and 90-day personal benchmarks.",
        comingSoon: true,
      },
      {
        id: "lc-2",
        title: "Coming Soon: Mentor Pairing Guidelines",
        type: "Resource Guide",
        description: "Overview of how residents are matched with dedicated Christian men's life mentors.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Disability Support",
    slug: "disability-support",
    description: "Assistance options, SSI/SSDI application support pathways, accessibility resources, and advocacy links.",
    resources: [
      {
        id: "dis-1",
        title: "Coming Soon: SSI/SSDI Disability Advocacy Connections",
        type: "Local Partner Directory",
        description: "Navigational support partners for Social Security Disability application processing.",
        comingSoon: true,
      },
      {
        id: "dis-2",
        title: "Coming Soon: Community Mobility & Accommodation Contacts",
        type: "Resource Guide",
        description: "Local resources for physical accessibility, assistive equipment, and specialized support.",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Local Services",
    slug: "local-services",
    description: "St. Charles County emergency relief, food pantries, clothing closets, and community assistance networks.",
    resources: [
      {
        id: "loc-1",
        title: "Coming Soon: St. Charles Food Pantry Directory",
        type: "Directory",
        description: "Operating hours and location details for regional food pantries and community meal sites.",
        comingSoon: true,
      },
      {
        id: "loc-2",
        title: "Coming Soon: Clothing & Essential Supplies Referral List",
        type: "Local Partner Directory",
        description: "Partners offering work boots, interview attire, and basic hygiene essentials.",
        comingSoon: true,
      },
    ],
  },
];
