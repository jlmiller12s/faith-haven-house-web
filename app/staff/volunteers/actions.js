"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentStaffUser } from "@/lib/rapAuth";
import { deleteVolunteerApplication } from "@/lib/volunteerDeletion.mjs";

export async function deleteApplication(id) {
  try {
    const client = await createSupabaseServerClient();
    const staff = await getCurrentStaffUser(client);
    const result = await deleteVolunteerApplication({ id, staff, createAdminClient: createSupabaseAdminClient });
    if (result.ok) revalidatePath("/staff/volunteers");
    return result;
  } catch {
    console.error("[VOLUNTEER_DELETE_FAILED] Application deletion failed");
    return { ok: false, error: "The application could not be deleted. Please try again." };
  }
}
