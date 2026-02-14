-- Check for database webhooks and triggers that might be causing the error
-- Run this in Supabase SQL Editor to diagnose

-- 1. Check for triggers on auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 2. Check for functions that reference auth.users
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%auth.users%'
  OR routine_definition ILIKE '%handle_new_user%';

-- 3. Check for existing webhook configurations (if any)
-- Note: Webhooks are configured in Supabase Dashboard, not in SQL
-- Go to: Database > Webhooks to check

-- 4. List all functions in public schema
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
