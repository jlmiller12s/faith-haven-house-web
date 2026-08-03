-- Curated website content and media storage for the staff CMS.
CREATE TABLE IF NOT EXISTS public.site_content (
  content_key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read website content"
  ON public.site_content;
CREATE POLICY "Public can read website content"
  ON public.site_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Leadership can insert website content"
  ON public.site_content;
CREATE POLICY "Leadership can insert website content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'executive_director')
    )
  );

DROP POLICY IF EXISTS "Leadership can update website content"
  ON public.site_content;
CREATE POLICY "Leadership can update website content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'executive_director')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'executive_director')
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media',
  'site-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view CMS media"
  ON storage.objects;
CREATE POLICY "Public can view CMS media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Leadership can upload CMS media"
  ON storage.objects;
CREATE POLICY "Leadership can upload CMS media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-media'
    AND EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'executive_director')
    )
  );
