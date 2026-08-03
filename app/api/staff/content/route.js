import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentStaffUser } from "@/lib/rapAuth";
import { canManageWebsiteContent } from "@/lib/cms/security.mjs";
import {
  CONTENT_FIELDS,
  mergeContentRows,
  validateContentValue,
} from "@/lib/cms/contentRegistry.mjs";

async function getAuthorizedContext() {
  const supabase = await createSupabaseServerClient();
  const staff = await getCurrentStaffUser(supabase);
  return { supabase, staff, allowed: canManageWebsiteContent(staff?.role) };
}
export async function GET() {
  const { supabase, allowed } = await getAuthorizedContext();
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase.from("site_content").select("content_key,value,updated_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fields: CONTENT_FIELDS, content: mergeContentRows(data) });
}

export async function PUT(request) {
  const { supabase, staff, allowed } = await getAuthorizedContext();
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const key = body?.key;
  const value = body?.value;
  const validation = validateContentValue(key, value);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const payload = {
    content_key: key,
    value: value.trim(),
    updated_at: new Date().toISOString(),
    updated_by: staff.authUserId,
  };
  const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "content_key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: payload });
}
