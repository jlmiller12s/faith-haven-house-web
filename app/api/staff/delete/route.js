import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentStaffUser, isSuperAdmin } from "@/lib/rapAuth";
import { NextResponse } from "next/server";
import { z } from "zod";

const DeleteSchema = z.object({
  profileIds: z.array(z.string().uuid()),
  actorId: z.string().uuid().optional(),
});

export async function POST(request) {
  try {
    // 1. Verify caller is authenticated and is super_admin
    const supabaseServer = await createSupabaseServerClient();
    const staffUser = await getCurrentStaffUser(supabaseServer);

    if (!staffUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdmin(staffUser.role)) {
      return NextResponse.json(
        { error: "Only super admins can remove team members." },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const parsed = DeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request data." },
        { status: 400 }
      );
    }

    const { profileIds, actorId } = parsed.data;

    // 3. Prevent self-deletion
    if (profileIds.includes(staffUser.id)) {
      return NextResponse.json(
        { error: "You cannot delete your own active session profile." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();

    // 4. Fetch the auth_user_ids for these staff profiles
    const { data: profiles, error: fetchError } = await admin
      .from("staff_profiles")
      .select("id, auth_user_id, email, first_name, last_name")
      .in("id", profileIds);

    if (fetchError) {
      console.error("[Delete Staff Fetch Error]", fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 5. Delete each staff member
    for (const p of profiles) {
      // Delete the public profile (RLS and constraints cascade)
      const { error: profileDelError } = await admin
        .from("staff_profiles")
        .delete()
        .eq("id", p.id);

      if (profileDelError) {
        console.error(`[Delete Staff Profile Error] ID: ${p.id}`, profileDelError.message);
        continue;
      }

      // Delete the Supabase Auth user
      if (p.auth_user_id) {
        const { error: authDelError } = await admin.auth.admin.deleteUser(p.auth_user_id);
        if (authDelError) {
          console.error(`[Delete Auth User Error] ID: ${p.auth_user_id}`, authDelError.message);
        }
      }

      // Log to Audit Trail
      const actorIdVal = actorId || staffUser.id;
      const { error: auditError } = await admin.from("audit_logs").insert({
        actor_id: actorIdVal,
        action: "staff_profile_deleted",
        entity_type: "staff_profile",
        entity_id: p.id,
        metadata: {
          deletedEmail: p.email,
          deletedName: `${p.first_name} ${p.last_name}`,
        },
      });
      if (auditError) {
        console.error("[Delete Staff Audit Error]", auditError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Delete Staff API Catch]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
