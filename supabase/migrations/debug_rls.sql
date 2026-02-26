-- =====================================================
-- Debug RLS and Profile Access
-- =====================================================
-- Run this to diagnose why profile is not accessible

-- 1. Check if RLS is enabled on profiles table
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. List all policies on profiles table
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
WHERE tablename = 'profiles';

-- 3. Check profiles table data
SELECT 
  id,
  email,
  full_name,
  nim,
  role,
  created_at
FROM profiles;

-- 4. Check auth.users table (if you have access)
-- This might fail if you're not using service role
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as google_name,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users;

-- 5. Check if there's an ID mismatch
-- Compare profiles.id with auth.users.id
SELECT 
  'Missing in profiles' as issue,
  au.id,
  au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'Missing in auth.users' as issue,
  p.id,
  p.email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;
