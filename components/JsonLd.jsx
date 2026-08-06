export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["NGO", "EmergencyShelter"],
    "name": "Faith Haven House",
    "legalName": "Faith Haven House",
    "url": "https://www.faithhavenhouse.org",
    "logo": "https://www.faithhavenhouse.org/assets/FHH-logo-clean.png",
    "image": "https://www.faithhavenhouse.org/assets/brand_values_bar.png",
    "description": "Faith Haven House is a 501(c)(3) non-profit transitional living facility for homeless men in St. Charles County, Missouri, dedicated to helping residents rebuild their lives and transition to permanent housing.",
    "telephone": "(636) 387-1755",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "St. Charles",
      "addressRegion": "MO",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "St. Charles County, Missouri"
    },
    "nonprofitStatus": "Nonprofit501c3",
    "foundingDate": "2021",
    "founder": {
      "@type": "Person",
      "name": "Dareth Jeffers"
    },
    "knowsAbout": [
      "Transitional Housing",
      "Homelessness Assistance",
      "Life-Skills Coaching",
      "Community Re-entry",
      "Christian Ministry"
    ],
    "sameAs": [
      "https://www.faithhavenhouse.org"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({ items }) {
  if (!items || !Array.isArray(items)) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question || item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer || item.a
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  if (!items || !Array.isArray(items)) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `https://www.faithhavenhouse.org${item.url}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
