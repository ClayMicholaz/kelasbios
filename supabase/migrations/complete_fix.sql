-- =====================================================
-- Complete Fix - RLS + Profile Data
-- =====================================================
-- Jalankan script ini LENGKAP dari atas sampai bawah
-- untuk fix semua masalah sekaligus

-- =====================================================
-- PART 1: Fix RLS Policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with correct permissions

-- Policy 1: Users can SELECT their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can INSERT their own profile (during signup)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can SELECT all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 5: Admins can UPDATE all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 6: Service role can do everything
CREATE POLICY "Service role full access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- =====================================================
-- PART 2: Update Profile Data
-- =====================================================

-- Step 1: Extract and set NIM from email for ALL profiles
UPDATE profiles
SET nim = SUBSTRING(email FROM '([0-9]{8})')
WHERE email ~ '[0-9]{8}@student\.ubm\.ac\.id'
  AND (nim IS NULL OR nim = '');

-- Step 2: Set role to 'admin' for designated admin emails
UPDATE profiles 
SET role = 'admin'
WHERE email IN (
  's32230111@student.ubm.ac.id',
  's32240127@student.ubm.ac.id',
  's32230123@student.ubm.ac.id',
  's32230130@student.ubm.ac.id',
  's32240207@student.ubm.ac.id',
  's32230099@student.ubm.ac.id'
);

-- Step 3: Set role to 'member' for everyone else (if NULL)
UPDATE profiles
SET role = 'member'
WHERE role IS NULL OR role NOT IN ('admin', 'member');

-- Step 4: Update full_name from auth.users metadata
UPDATE profiles p
SET full_name = COALESCE(
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'name',
  SPLIT_PART(au.email, '@', 1)
)
FROM auth.users au
WHERE p.id = au.id
  AND (p.full_name IS NULL OR p.full_name = '' OR p.full_name = 'User');

-- =====================================================
-- PART 3: Verification
-- =====================================================

-- Show all policies
SELECT 
  '=== RLS POLICIES ===' as info,
  policyname,
  cmd as operation,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Show all profiles
SELECT 
  '=== ALL PROFILES ===' as info,
  email,
  full_name,
  nim,
  role,
  created_at
FROM profiles
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'member' THEN 2 
    ELSE 3 
  END,
  email;

-- Count by role
SELECT 
  '=== ROLE COUNT ===' as info,
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;

-- Check for missing data
SELECT 
  '=== DATA COMPLETENESS ===' as info,
  COUNT(*) FILTER (WHERE full_name IS NULL OR full_name = 'User') as missing_name,
  COUNT(*) FILTER (WHERE nim IS NULL OR nim = '') as missing_nim,
  COUNT(*) FILTER (WHERE role IS NULL) as missing_role,
  COUNT(*) as total_profiles
FROM profiles;

-- Show specific user profile (untuk user yang sedang login)
SELECT 
  '=== YOUR PROFILE (should match auth.uid()) ===' as info,
  id,
  email,
  full_name,
  nim,
  role,
  created_at
FROM profiles 
WHERE email = 's32230111@student.ubm.ac.id';
