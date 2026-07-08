import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StaffClientProvider } from "./StaffClientProvider";

// Routes that do not require layout-level authentication gates
const PUBLIC_STAFF_ROUTES = [
  "/staff/login",
  "/staff/forgot-password",
  "/staff/reset-password",
  "/staff/auth/callback",
  "/auth/callback",
  "/staff/unauthorized",
  "/staff/signup",
  "/staff/mfa/setup",
  "/staff/mfa/verify",
];

export default async function StaffLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Check if path is allowed publicly
  const isPublicPath = PUBLIC_STAFF_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublicPath) {
    return (
      <StaffClientProvider initialActiveStaff={null}>
        {children}
      </StaffClientProvider>
    );
  }

  // --- Protected staff portal routes check (Server-side Node.js environment) ---
  const supabase = await createSupabaseServerClient();
  
  // 1. Get authenticated session user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/staff/login");
  }

  // 2. Fetch staff profile to verify active status and role permissions
  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("id, first_name, last_name, email, role, is_active, mfa_required")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    redirect("/staff/unauthorized");
  }

  // 3. Enforce MFA if required for the profile
  if (profile.mfa_required) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (aalData?.currentLevel !== "aal2") {
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      const hasVerified = factorData?.totp?.some((f) => f.status === "verified");
      
      if (hasVerified) {
        redirect("/staff/mfa/verify");
      } else {
        redirect("/staff/mfa/setup");
      }
    }
  }

  // All checks passed — render layout wrapper with verified profile details
  return (
    <StaffClientProvider initialActiveStaff={profile}>
      {children}
    </StaffClientProvider>
  );
}

// Re-export hook for components importing useStaffSession from @/app/staff/layout
export { useStaffSession } from "./StaffClientProvider";
