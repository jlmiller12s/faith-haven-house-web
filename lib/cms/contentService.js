import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeContentRows } from "./contentRegistry.mjs";

export async function getPublishedSiteContent() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return mergeContentRows();
    }
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("site_content").select("content_key,value,updated_at");
    if (error) return mergeContentRows();
    return mergeContentRows(data);
  } catch {
    return mergeContentRows();
  }
}
