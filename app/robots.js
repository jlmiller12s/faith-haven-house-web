export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/staff/",
        "/secure/",
        "/api/",
        "/auth/",
        "/staff",
        "/secure",
        "/api",
        "/auth"
      ],
    },
    sitemap: "https://www.faithhavenhouse.org/sitemap.xml",
  };
}
