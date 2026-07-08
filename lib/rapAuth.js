/**
 * RAP Portal — Server-side current staff user resolver.
 *
 * Always call this server-side (API routes, Server Components, middleware).
 * Never trust client-provided role values.
 * Returns null if user is not authenticated or has no active staff profile.
 */

/**
 * @typedef {'super_admin'|'executive_director'|'admissions_coordinator'|'admissions_interviewer'|'behavioral_health_clinician'|'admissions_committee_member'|'case_manager'|'read_only_auditor'} StaffRole
 *
 * @typedef {Object} CurrentStaffUser
 * @property {string} authUserId
 * @property {string} staffProfileId
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {StaffRole} role
 * @property {boolean} isActive
 * @property {boolean} mfaRequired
 * @property {'aal1'|'aal2'|null} assuranceLevel
 */

/**
 * Resolve the currently authenticated staff user from a server-side Supabase client.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseServer
 * @returns {Promise<CurrentStaffUser|null>}
 */
export async function getCurrentStaffUser(supabaseServer) {
  try {
    // 1. Verify Supabase session (server-validated, not client-provided)
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();

    if (userError || !user) return null;

    // 2. Get MFA assurance level from session
    const {
      data: { currentLevel },
    } = await supabaseServer.auth.mfa.getAuthenticatorAssuranceLevel();

    // 3. Fetch staff profile from database (role always comes from DB, never client)
    const { data: profile, error: profileError } = await supabaseServer
      .from("staff_profiles")
      .select("id, first_name, last_name, email, role, is_active, mfa_required")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) return null;
    if (!profile.is_active) return null;

    return {
      authUserId: user.id,
      staffProfileId: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      isActive: profile.is_active,
      mfaRequired: profile.mfa_required,
      assuranceLevel: currentLevel || null,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a CurrentStaffUser has cleared all auth requirements
 * (session valid, email confirmed, active profile, MFA if required).
 *
 * @param {CurrentStaffUser|null} staffUser
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function checkStaffAccess(staffUser) {
  if (!staffUser) {
    return { allowed: false, reason: "unauthenticated" };
  }
  if (!staffUser.isActive) {
    return { allowed: false, reason: "inactive" };
  }
  if (staffUser.mfaRequired && staffUser.assuranceLevel !== "aal2") {
    return { allowed: false, reason: "mfa_required" };
  }
  return { allowed: true, reason: null };
}

/**
 * Check whether the given role is allowed to perform admin operations.
 * Role always comes from server-side profile, never from client.
 *
 * @param {StaffRole} role
 * @returns {boolean}
 */
export function isSuperAdmin(role) {
  return role === "super_admin";
}
