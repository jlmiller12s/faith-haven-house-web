-- Migration: Create blog_posts table and RLS policies
-- Created for RAP Portal Blog Manager

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  eyebrow TEXT DEFAULT 'Updates from the Executive Director',
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Dareth Jeffers, Founder & Executive Director',
  author_image TEXT DEFAULT '/assets/lg.jpg',
  cover_image TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read published posts
CREATE POLICY "Public read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Policy 2: Staff can view all blog posts
CREATE POLICY "Staff view all blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Policy 3: Staff can insert blog posts
CREATE POLICY "Staff insert blog posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Policy 4: Staff can update blog posts
CREATE POLICY "Staff update blog posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Policy 5: Staff can delete blog posts
CREATE POLICY "Staff delete blog posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Insert initial seed post if table is empty
INSERT INTO public.blog_posts (
  id,
  title,
  slug,
  eyebrow,
  excerpt,
  content,
  author_name,
  author_image,
  published_at,
  status
)
VALUES (
  'e2b4f98d-8a71-4b46-9d32-671234567890',
  'Hello and Thank You',
  'hello-and-thank-you',
  'Updates from the Executive Director',
  'So much to be thankful for here at Faith Haven House! The first month of having residents is now under our belt. It has been a very successful month in my book. Job obtained, interviews had, and donations have been pouring in, and our first resident is moving out! We are so blessed! I am so humbled that God chose me. We are still ironing out routines and getting used to the process...',
  'So much to be thankful for here at Faith Haven House! The first month of having residents is now under our belt. It has been a very successful month in my book. Job obtained, interviews had, and donations have been pouring in, and our first resident is moving out! We are so blessed! I am so humbled that God chose me. We are still ironing out routines and getting used to the process.\n\nThank you to everyone in St. Charles County who has prayed, donated meals, and supported our mission to provide dignity and a path forward for unhoused men in our community.',
  'Dareth Jeffers, Founder & Executive Director',
  '/assets/lg.jpg',
  '2022-12-14T00:00:00Z',
  'published'
)
ON CONFLICT (slug) DO NOTHING;
