import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentStaffUser, isSuperAdmin } from "@/lib/rapAuth";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/staff/invite
 *
 * Invite a new staff member to the RAP Portal.
 * Restricted to super_admin role only.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY server-side only — never exposed to client.
 * Creates Supabase Auth user + staff_profiles row + sends invite email.
 */

const InviteSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  role: z.enum([
    "super_admin",
    "executive_director",
    "admissions_coordinator",
    "admissions_interviewer",
    "behavioral_health_clinician",
    "admissions_committee_member",
    "case_manager",
    "read_only_auditor",
  ]),
  note: z.string().max(500).optional(),
});

export async function POST(request) {
  try {
    // 1. Verify caller is authenticated and is super_admin (server-side)
    const supabaseServer = await createSupabaseServerClient();
    const staffUser = await getCurrentStaffUser(supabaseServer);

    if (!staffUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(staffUser.role)) {
      return NextResponse.json(
        { error: "Only super admins can invite staff members." },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const parsed = InviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request data." },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, role, note } = parsed.data;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://faith-haven-house-web.vercel.app";

    // 3. Invite via Supabase Admin API (service role — server only)
    const admin = createSupabaseAdminClient();
    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
        },
      });

    if (inviteError) {
      // Do not expose raw Supabase error to client
      console.error("[RAP invite error]", inviteError.message);
      return NextResponse.json(
        { error: "Could not send invitation. The email may already be registered." },
        { status: 400 }
      );
    }

    // 4. Create staff_profiles row
    const { error: profileError } = await admin
      .from("staff_profiles")
      .upsert(
        {
          auth_user_id: inviteData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          role,
          is_active: true,
          mfa_required: true,
        },
        { onConflict: "email" }
      );

    if (profileError) {
      console.error("[RAP profile create error]", profileError.message);
      // Non-fatal — user was invited, profile can be created on first login via trigger
    }

    // 5. Audit log (minimal metadata — no secrets)
    await admin.from("audit_logs").insert({
      actor_id: staffUser.staffProfileId,
      action: "staff_invited",
      entity_type: "staff_profile",
      entity_id: inviteData.user.id,
      metadata_safe: {
        invited_email: email,
        assigned_role: role,
        ...(note ? { note_provided: true } : {}),
      },
      ip_hash: "server_action",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[RAP invite unexpected error]", err?.message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
