-- =====================================================
-- Check Current Profiles State
-- =====================================================
-- Run this to see what's currently in the database

-- 1. Show all profiles with details
SELECT 
  id,
  email,
  full_name,
  nim,
  role,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Count by role
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;

-- 3. Check for NULL values
SELECT 
  COUNT(*) as total_profiles,
  COUNT(full_name) as has_full_name,
  COUNT(nim) as has_nim,
  COUNT(role) as has_role
FROM profiles;

-- 4. Show profiles with missing data
SELECT 
  email,
  full_name,
  nim,
  role,
  CASE 
    WHEN full_name IS NULL THEN 'Missing name' 
    WHEN nim IS NULL THEN 'Missing NIM'
    WHEN role IS NULL THEN 'Missing role'
    ELSE 'OK'
  END as status
FROM profiles
WHERE full_name IS NULL OR nim IS NULL OR role IS NULL;
