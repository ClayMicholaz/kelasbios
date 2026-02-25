-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================
-- Problem: Policies that check admin role by querying profiles table
-- cause infinite recursion. Solution: Use SECURITY DEFINER function
-- that bypasses RLS when checking role.

-- =====================================================
-- 1. Create helper function to check admin role
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO anon;

-- =====================================================
-- 2. Fix Profiles Table Policies
-- =====================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with fixed logic
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  public.get_user_role(auth.uid()) = 'admin'
);

-- =====================================================
-- 3. Fix Classes Table Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Only admins can update classes" ON public.classes;
DROP POLICY IF EXISTS "Only admins can delete classes" ON public.classes;

-- Recreate with fixed logic
CREATE POLICY "Only admins can insert classes"
ON public.classes
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update classes"
ON public.classes
FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete classes"
ON public.classes
FOR DELETE
USING (public.get_user_role(auth.uid()) = 'admin');
