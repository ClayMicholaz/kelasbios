-- =====================================================
-- Fix Infinite Recursion in RLS Policies
-- =====================================================
-- Problem: Admin policies yang mengecek role dari profiles
-- menyebabkan infinite recursion karena akses profiles 
-- memicu policy yang mengakses profiles lagi.
--
-- Solution: Hapus policy admin yang recursive, 
-- gunakan simple policies saja. Admin operations 
-- akan menggunakan service_role key di backend.

-- Step 1: Drop SEMUA policies yang ada
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Step 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create SIMPLE policies tanpa recursion

-- ✅ Policy 1: Users dapat SELECT profile mereka sendiri
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ✅ Policy 2: Users dapat INSERT profile mereka sendiri
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ✅ Policy 3: Users dapat UPDATE profile mereka sendiri
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ✅ Policy 4: Service role full access (untuk admin operations di backend)
CREATE POLICY "profiles_service_role_all"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 4: Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Step 5: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test - coba query profile
SELECT 
  id, 
  email, 
  full_name, 
  nim, 
  role,
  created_at
FROM profiles 
WHERE id = auth.uid();

-- =====================================================
-- CATATAN PENTING:
-- =====================================================
-- 1. Sekarang TIDAK ADA policy untuk admin view all profiles
-- 2. Admin operations (view all, update any) harus menggunakan 
--    service_role key di backend/API routes
-- 3. Regular users hanya bisa akses profile mereka sendiri
-- 4. Ini mencegah infinite recursion sepenuhnya
-- =====================================================
