CREATE TABLE public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  firstname TEXT NOT NULL CHECK (length(trim(firstname)) BETWEEN 1 AND 100),
  lastname TEXT NOT NULL CHECK (length(trim(lastname)) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone TEXT NOT NULL CHECK (length(trim(phone)) BETWEEN 1 AND 50),
  positions TEXT[] NOT NULL DEFAULT '{}' CHECK (positions <@ ARRAY['Daytime Monitor','Meal Delivery','Life Skills','Mentor']::TEXT[] AND cardinality(positions) <= 4),
  skills TEXT NOT NULL DEFAULT '' CHECK (length(skills) <= 5000),
  availability TEXT NOT NULL DEFAULT '' CHECK (length(availability) <= 2000)
);
CREATE INDEX volunteer_applications_created_at_idx ON public.volunteer_applications (created_at DESC);
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.volunteer_applications FROM anon, authenticated;
GRANT SELECT ON public.volunteer_applications TO authenticated;
GRANT ALL ON public.volunteer_applications TO service_role;
CREATE POLICY "Leadership can read volunteer applications"
  ON public.volunteer_applications FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE auth_user_id = auth.uid() AND is_active = true
      AND role IN ('super_admin', 'executive_director')
      AND (NOT mfa_required OR (auth.jwt()->>'aal') = 'aal2')
  ));
