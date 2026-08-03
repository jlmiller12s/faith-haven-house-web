import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentStaffUser } from "@/lib/rapAuth";
import { canManageWebsiteContent, safeMediaFilename } from "@/lib/cms/security.mjs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const staff = await getCurrentStaffUser(supabase);
  if (!canManageWebsiteContent(staff?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, AVIF, or GIF image." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
  }

  const filename = safeMediaFilename(file.name, file.type);
  const path = `website/${filename}`;
  const { error } = await supabase.storage
    .from("site-media")
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("site-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
