const STORY_SEEDS = [
  {
    name: "Eric",
    date: "Graduate — January 14, 2023",
    quote: "In the 36 days that he was here, Eric was able to obtain a full-time job while continuing to drive for Door Dash to supplement his income. He moved into permanent housing through the First Step Back Home program! We are so happy to partner with an amazing organization to help one of our residents obtain his independence again! With God, we can do more!",
  },
  {
    name: "Devon",
    date: "First Graduate — December 22, 2022",
    quote: "We had our first graduate, Devon! Devon made huge progress in the month he was with us. He came from living in a tent where he had been for quite some time. By the time he left, he was smiling and laughing, working in a field that he enjoys, and staying in a stable place. I truly believe that the men who come to us just need that extra little lift.",
  },
];

const STORY_FIELDS = Array.from({ length: 10 }, (_, index) => {
  const slot = index + 1;
  const seed = STORY_SEEDS[index] || {};
  return [
    { key: `stories.${slot}.name`, page: "Stories", section: `Story ${slot}`, label: "Graduate name", type: "text", defaultValue: seed.name || "", optional: true },
    { key: `stories.${slot}.date`, page: "Stories", section: `Story ${slot}`, label: "Date or milestone", type: "text", defaultValue: seed.date || "", optional: true },
    { key: `stories.${slot}.image`, page: "Stories", section: `Story ${slot}`, label: "Photo", type: "image", defaultValue: "", optional: true },
    { key: `stories.${slot}.quote`, page: "Stories", section: `Story ${slot}`, label: "Approved story", type: "textarea", defaultValue: seed.quote || "", optional: true },
  ];
}).flat();

export const CONTENT_FIELDS = [
  { key: "home.hero.title", page: "Homepage", section: "Hero", label: "Main headline", type: "text", defaultValue: "Every call answered. Every bed filled." },
  { key: "home.hero.subtitle", page: "Homepage", section: "Hero", label: "Second headline", type: "text", defaultValue: "A sanctuary to rebuild lives." },
  { key: "home.hero.tagline", page: "Homepage", section: "Hero", label: "Intro text", type: "textarea", defaultValue: "Faith Haven House provides a supportive network, daily shelter, and life skills coaching to guide unhoused men from transition to independent homeownership." },
  { key: "home.mission.text", page: "Homepage", section: "Mission", label: "Mission statement", type: "textarea", defaultValue: "Faith Haven House will be a place where residents start the re-building process. We work with homeless men, providing a stable living environment. Throughout transition, they receive a network of support with available resources to meet their physical and spiritual needs." },
  { key: "home.founder.text", page: "Homepage", section: "Founder", label: "Founder summary", type: "textarea", defaultValue: "Between 2013 and 2015, Dareth Jeffers served meals to unhoused men and women. The standard answer to shelter requests was no. Dareth prayed, found servant-hearted partners, designed a logo, and made a plan. Faith Haven House became that YES. Today, men have a place to stay and a chance to rebuild." },
  { key: "home.perspective.title", page: "Homepage", section: "Perspective", label: "Heading", type: "text", defaultValue: "One Life Event Away" },
  { key: "home.perspective.text", page: "Homepage", section: "Perspective", label: "Body text", type: "textarea", defaultValue: "In St. Charles County, homelessness among single men rarely happens overnight. Most residents at Faith Haven House are good, hardworking men who found themselves just one crisis away — one sudden illness, one job loss, one family tragedy, or one broken relationship away from losing their shelter." },
  { key: "home.stories.eric", page: "Homepage", section: "Success stories", label: "Eric's story", type: "textarea", defaultValue: "In the 36 days that he was here, Eric was able to obtain a full-time job while continuing to drive for Door Dash to supplement his income. He moved into permanent housing through the First Step Back Home program! We are so happy to partner with an amazing organization to help one of our residents obtain his independence again! With God, we can do more!" },
  { key: "home.stories.devon", page: "Homepage", section: "Success stories", label: "Devon's story", type: "textarea", defaultValue: "We had our first graduate, Devon! Devon made huge progress in the month he was with us. He came from living in a tent where he had been for quite some time. By the time he left, he was smiling and laughing, working in a field that he enjoys, and staying in a stable place. I truly believe that the men who come to us just need that extra little lift." },
  { key: "home.donate.title", page: "Homepage", section: "Donation callout", label: "Heading", type: "text", defaultValue: "With God, We Can Do More" },
  { key: "home.donate.text", page: "Homepage", section: "Donation callout", label: "Body text", type: "textarea", defaultValue: "Any donation is accepted with nothing but kindness at our facility. Your support goes directly towards the empowerment, facilitation, and stable transition of every resident during their stay." },
  { key: "about.hero.title", page: "About", section: "Introduction", label: "Page heading", type: "text", defaultValue: "Rebuilding Lives, Restoring Hope" },
  { key: "about.hero.text", page: "About", section: "Introduction", label: "Intro text", type: "textarea", defaultValue: "Faith Haven House will be a place where the residents can start the re-building process. We will be working with homeless men with the goal to help them transition to a stable living environment. Throughout the transition, they will receive a network of support with available resources." },
  { key: "about.founder.image", page: "About", section: "Founder", label: "Founder photo", type: "image", defaultValue: "/assets/dareth_founder_1.avif" },
  { key: "about.founder.name", page: "About", section: "Founder", label: "Founder name", type: "text", defaultValue: "Dareth Jeffers" },
  { key: "about.gallery.1", page: "About", section: "Photo gallery", label: "Community photo 1", type: "image", defaultValue: "/assets/dareth_founder_2.avif" },
  { key: "about.gallery.2", page: "About", section: "Photo gallery", label: "Community photo 2", type: "image", defaultValue: "/assets/fhh_community_1.avif" },
  { key: "about.gallery.3", page: "About", section: "Photo gallery", label: "Community photo 3", type: "image", defaultValue: "/assets/fhh_community_2.avif" },
  { key: "about.gallery.4", page: "About", section: "Photo gallery", label: "Community photo 4", type: "image", defaultValue: "/assets/fhh_community_3.avif" },
  ...STORY_FIELDS,
];

const FIELD_MAP = new Map(CONTENT_FIELDS.map((field) => [field.key, field]));

export function getContentDefaults() {
  return Object.fromEntries(CONTENT_FIELDS.map((field) => [field.key, field.defaultValue]));
}

export function mergeContentRows(rows = []) {
  const result = getContentDefaults();
  for (const row of rows || []) {
    if (FIELD_MAP.has(row.content_key) && typeof row.value === "string") {
      result[row.content_key] = row.value;
    }
  }
  return result;
}

export function validateContentValue(key, value) {
  const field = FIELD_MAP.get(key);
  if (!field) return { valid: false, error: "Unknown content field." };
  if (field.optional && (value === "" || value == null)) return { valid: true, error: null };
  if (typeof value !== "string" || !value.trim()) return { valid: false, error: "Content cannot be empty." };
  const max = field.type === "textarea" ? 5000 : 500;
  if (value.length > max) return { valid: false, error: `Content must be ${max} characters or fewer.` };
  if (field.type === "image" && !/^\/assets\/[a-zA-Z0-9._/-]+$|^https:\/\/[^\s]+$/i.test(value)) {
    return { valid: false, error: "Image must be a secure URL or an existing site asset." };
  }
  return { valid: true, error: null };
}
