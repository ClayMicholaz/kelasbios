-- =====================================================
-- Fix Existing Profiles - Complete Update
-- =====================================================
-- This script comprehensively updates all profiles
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
--
-- What this script does:
-- 1. Extract and set NIM from email (8 digits)
-- 2. Set role to 'admin' for designated emails
-- 3. Set role to 'member' for all others
-- 4. Update full_name from auth.users metadata
--
-- NOTE: For full_name to update properly, users need to logout and login again
-- because we cannot directly access auth.users.user_metadata from SQL
-- =====================================================

-- Step 1: Extract and set NIM from email for ALL profiles
UPDATE profiles
SET nim = SUBSTRING(email FROM '([0-9]{8})')
WHERE email ~ '[0-9]{8}@student\.ubm\.ac\.id'
  AND (nim IS NULL OR nim = '');

-- Step 2: Set role to 'admin' for designated admin emails
-- EDIT THIS LIST as needed
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

-- Step 3: Set role to 'member' for everyone else (if NULL or not admin)
UPDATE profiles
SET role = 'member'
WHERE role IS NULL OR role NOT IN ('admin', 'member');

-- Step 4: Update full_name using auth.users raw_user_meta_data
-- This uses a function to access auth.users metadata
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
-- Verification Queries
-- =====================================================

-- Show all profiles to verify
SELECT 
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
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;

-- Check for any remaining NULL values
SELECT 
  COUNT(*) FILTER (WHERE full_name IS NULL OR full_name = 'User') as missing_name,
  COUNT(*) FILTER (WHERE nim IS NULL OR nim = '') as missing_nim,
  COUNT(*) FILTER (WHERE role IS NULL) as missing_role,
  COUNT(*) as total_profiles
FROM profiles;

-- Step 2: Extract and set NIM from email for profiles that don't have NIM yet
UPDATE profiles
SET nim = SUBSTRING(email FROM '([0-9]{8})')
WHERE nim IS NULL 
  AND email ~ '[0-9]{8}@student\.ubm\.ac\.id';

-- Step 3: Ensure all profiles have a role (default to 'member' if NULL)
UPDATE profiles
SET role = 'member'
WHERE role IS NULL;

-- Step 4: Display updated profiles for verification
SELECT 
  id,
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

-- Verify admin count
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;
