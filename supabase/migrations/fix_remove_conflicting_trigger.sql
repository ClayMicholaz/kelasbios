-- Remove conflicting handle_new_user function and trigger
-- This is causing the "Database error saving new user" error

-- 1. First, check what the function does
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 2. Check if there's a trigger using this function
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth' OR trigger_schema = 'public'
  AND action_statement ILIKE '%handle_new_user%';

-- 3. Drop the trigger if it exists (run after checking above)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Confirm deletion
SELECT 'Conflicting trigger and function removed successfully' as status;
