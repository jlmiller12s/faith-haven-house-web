const CONTENT_ROLES = new Set(["super_admin", "executive_director"]);

export function canManageWebsiteContent(role) {
  return CONTENT_ROLES.has(role);
}
export function safeMediaFilename(originalName, mimeType) {
  const extensionByMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  const extension = extensionByMime[mimeType] || "jpg";
  const base = String(originalName || "website-image")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "website-image";
  return `${Date.now()}-${base}.${extension}`;
}
