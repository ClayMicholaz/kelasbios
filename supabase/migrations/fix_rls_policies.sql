-- =====================================================
-- Fix RLS Policies for Profiles Table
-- =====================================================
-- Run this BEFORE fix_existing_profiles.sql
-- This ensures users can read/write their own profiles

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Step 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies with correct permissions

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

-- Policy 6: Service role can do everything (bypass RLS in migrations)
-- This is automatic for service_role, but we can be explicit
CREATE POLICY "Service role full access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 4: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Step 5: Verify policies are created
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test query (should return your profile if logged in)
-- Run this after logging in to test
SELECT id, email, full_name, nim, role 
FROM profiles 
WHERE id = auth.uid();
