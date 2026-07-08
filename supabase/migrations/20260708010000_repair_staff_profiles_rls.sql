-- Repair production staff profile policies after the original auth migration
-- was already recorded and could no longer be changed in place.

BEGIN;

-- This helper is deliberately SECURITY DEFINER so its lookup does not invoke
-- staff_profiles RLS again. It only returns the current authenticated user's
-- active role, and the empty search path prevents object-shadowing attacks.
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT sp.role
  FROM public.staff_profiles AS sp
  WHERE sp.auth_user_id = (SELECT auth.uid())
    AND sp.is_active IS TRUE
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_auth_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated;

-- Remove both the legacy policies and the recursive policies from the later
-- auth migration so the resulting policy set is deterministic.
DROP POLICY IF EXISTS staff_profiles_read_all ON public.staff_profiles;
DROP POLICY IF EXISTS staff_profiles_write_admin ON public.staff_profiles;
DROP POLICY IF EXISTS "staff can read own active profile" ON public.staff_profiles;
DROP POLICY IF EXISTS "super admin can manage staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "super admin can read all staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "staff_profiles_anon_deny" ON public.staff_profiles;
DROP POLICY IF EXISTS "staff_profiles_self_read" ON public.staff_profiles;
DROP POLICY IF EXISTS "staff_profiles_authenticated_list" ON public.staff_profiles;
DROP POLICY IF EXISTS "staff_profiles_admin_write" ON public.staff_profiles;

CREATE POLICY "staff_profiles_anon_deny"
  ON public.staff_profiles
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- An inactive staff member must be able to read their own row so the app can
-- show the correct deactivated-account message after authentication.
CREATE POLICY "staff_profiles_self_read"
  ON public.staff_profiles
  FOR SELECT
  TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

-- Active staff can list profiles for assignment controls. The helper bypasses
-- RLS for its single identity lookup, avoiding recursive policy evaluation.
CREATE POLICY "staff_profiles_authenticated_list"
  ON public.staff_profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT public.get_auth_role()) IS NOT NULL);

CREATE POLICY "staff_profiles_admin_write"
  ON public.staff_profiles
  FOR ALL
  TO authenticated
  USING ((SELECT public.get_auth_role()) = 'super_admin')
  WITH CHECK ((SELECT public.get_auth_role()) = 'super_admin');

COMMIT;
