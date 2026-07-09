export default function sitemap() {
  const baseUrl = "https://www.faithhavenhouse.org";
  
  const routes = [
    { url: "", changeFrequency: "daily", priority: 1.0 },
    { url: "/admissions", changeFrequency: "weekly", priority: 0.9 },
    { url: "/get-help", changeFrequency: "monthly", priority: 0.9 },
    { url: "/about", changeFrequency: "monthly", priority: 0.8 },
    { url: "/roadmap", changeFrequency: "weekly", priority: 0.8 },
    { url: "/stories", changeFrequency: "weekly", priority: 0.8 },
    { url: "/volunteer", changeFrequency: "monthly", priority: 0.8 },
    { url: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { url: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { url: "/one-away", changeFrequency: "monthly", priority: 0.8 },
    { url: "/about/dareth-jeffers", changeFrequency: "monthly", priority: 0.7 },
    { url: "/about/faq", changeFrequency: "monthly", priority: 0.7 },
    { url: "/resources", changeFrequency: "monthly", priority: 0.7 },
    { url: "/partners", changeFrequency: "monthly", priority: 0.7 },
    { url: "/terms", changeFrequency: "monthly", priority: 0.5 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
