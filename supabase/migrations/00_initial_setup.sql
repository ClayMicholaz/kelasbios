-- =====================================================
-- BIOS LMS - Initial Database Setup
-- =====================================================
-- This migration creates all necessary tables, triggers, and policies
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- =====================================================
-- 1. CREATE PROFILES TABLE
-- =====================================================
-- This table stores user profile information
-- It's linked to auth.users via the id column

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  nim VARCHAR(20),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_nim ON public.profiles(nim);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Add comments
COMMENT ON TABLE public.profiles IS 'User profiles with additional information beyond auth.users';
COMMENT ON COLUMN public.profiles.id IS 'User UUID from auth.users';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name from Google OAuth or manual entry';
COMMENT ON COLUMN public.profiles.nim IS 'Nomor Induk Mahasiswa - 8 digit student ID extracted from email';
COMMENT ON COLUMN public.profiles.role IS 'User role: admin or member';

-- =====================================================
-- 2. CREATE TRIGGER FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Allow authenticated users to insert their own profile (for OAuth signup)
CREATE POLICY "Enable insert for authenticated users during signup"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 4. CREATE CLASSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  class_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  instructor VARCHAR(255),
  duration VARCHAR(50),
  price INTEGER DEFAULT 10000,
  max_participants INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  syllabus TEXT[],
  requirements TEXT[],
  materials_url TEXT,
  zoom_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_date ON public.classes(class_date);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS set_classes_updated_at ON public.classes;
CREATE TRIGGER set_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view open classes" ON public.classes;
DROP POLICY IF EXISTS "Only admins can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Only admins can update classes" ON public.classes;
DROP POLICY IF EXISTS "Only admins can delete classes" ON public.classes;

-- Policy: Everyone can view open classes
CREATE POLICY "Anyone can view open classes"
ON public.classes
FOR SELECT
USING (status = 'open' OR auth.uid() IS NOT NULL);

-- Policy: Only admins can insert classes
CREATE POLICY "Only admins can insert classes"
ON public.classes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can update classes
CREATE POLICY "Only admins can update classes"
ON public.classes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can delete classes
CREATE POLICY "Only admins can delete classes"
ON public.classes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 5. CREATE ENROLLMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'verified', 'rejected')),
  payment_proof_url TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  UNIQUE(user_id, class_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(payment_status);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own pending enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can update all enrollments" ON public.enrollments;

-- Policy: Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own enrollments
CREATE POLICY "Users can insert their own enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending enrollments
CREATE POLICY "Users can update their own pending enrollments"
ON public.enrollments
FOR UPDATE
USING (auth.uid() = user_id AND payment_status = 'pending');

-- Policy: Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can update all enrollments
CREATE POLICY "Admins can update all enrollments"
ON public.enrollments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 6. CREATE STORAGE BUCKETS
-- =====================================================

-- Create payment_proofs bucket for storing payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_proofs', 'payment_proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Create class_materials bucket for storing class materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('class_materials', 'class_materials', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload class materials" ON storage.objects;
DROP POLICY IF EXISTS "Enrolled users can view class materials" ON storage.objects;

-- Storage policies for payment_proofs
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment_proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment_proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment_proofs' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Storage policies for class_materials
CREATE POLICY "Admins can upload class materials"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'class_materials' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Enrolled users can view class materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'class_materials' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.enrollments e
      INNER JOIN public.classes c ON e.class_id = c.id
      WHERE e.user_id = auth.uid()
        AND e.payment_status = 'verified'
        AND (storage.foldername(name))[1] = c.id::text
    )
  )
);

-- =====================================================
-- 7. VERIFICATION & TESTING
-- =====================================================

-- Run this to verify everything is set up correctly:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Should show: profiles, classes, enrollments

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All should have rowsecurity = true

COMMENT ON TABLE public.classes IS 'Classes offered by BIOS';
COMMENT ON TABLE public.enrollments IS 'Student enrollments in classes with payment tracking';
