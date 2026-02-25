# 🔧 URGENT FIX: Infinite Recursion Error

## Masalah

Database RLS policies menyebabkan **infinite recursion** ketika mencoba membuat atau membaca profile. Ini karena policy admin check mencoba query ke `profiles` table di dalam policy itu sendiri.

## Solusi

Jalankan SQL berikut di **Supabase SQL Editor**:

### Langkah-langkah:

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste SQL di bawah ini
6. Klik **Run** atau tekan `Ctrl+Enter`

---

## SQL Fix

```sql
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
```

---

## Setelah Menjalankan SQL

1. **Restart development server** (jika belum):

   ```powershell
   npm run dev
   ```

2. **Clear browser storage**:
   - Buka DevTools (F12)
   - Tab **Application** → **Clear site data**

3. **Login ulang** dengan akun Google UBM Anda

4. **Cek di Supabase**:
   - Buka **Table Editor** → **profiles**
   - Seharusnya ada record baru dengan data Anda

---

## Penjelasan Teknis

**Sebelum (Bermasalah)**:

```sql
-- Policy ini menyebabkan infinite recursion
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles  -- ❌ Query ke profiles dalam policy profiles!
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Sesudah (Fixed)**:

```sql
-- Function dengan SECURITY DEFINER bypass RLS
CREATE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR
SECURITY DEFINER  -- ✅ Bypass RLS!

-- Policy menggunakan function
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR
  get_user_role(auth.uid()) = 'admin'  -- ✅ No recursion!
);
```

`SECURITY DEFINER` membuat function dijalankan dengan permission dari function creator (bukan user), sehingga bypass RLS dan tidak ada recursion.
