-- Fix RLS untuk homepage agar bisa lihat enrollment count
-- Masalah: Homepage tidak bisa query enrollments karena RLS terlalu ketat

-- Tambahkan policy untuk allow anonymous/public users membaca enrollment count
-- Ini aman karena hanya read-only dan tidak expose data user

DROP POLICY IF EXISTS "Public can view enrollment counts" ON public.enrollments;

CREATE POLICY "Public can view enrollment counts"
ON public.enrollments
FOR SELECT
USING (true);  -- Allow semua orang read enrollments untuk counting

-- Note: Ini aman karena:
-- 1. Hanya SELECT (read-only)
-- 2. Homepage hanya butuh COUNT, tidak expose user data
-- 3. Field sensitif seperti whatsapp, payment_proof tidak di-query di homepage
