# Fix Upload Bukti Pembayaran - RLS Policy Error

## Error

```
new row violates row-level security policy
```

## Penyebab

Error ini terjadi karena:

1. Storage bucket `payment-proofs` belum dikonfigurasi dengan benar
2. RLS Policies untuk storage.objects belum diset
3. RLS Policies untuk table enrollments belum mengizinkan update

## Solusi

### Cara 1: Via Supabase Dashboard (RECOMMENDED)

1. **Buka Supabase Dashboard**: https://app.supabase.com
2. **Pilih Project** Anda
3. **Buka SQL Editor** (dari sidebar kiri)
4. **Copy** seluruh isi file `supabase/migrations/fix_payment_storage_rls.sql`
5. **Paste** ke SQL Editor
6. **Klik "Run"**

### Cara 2: Via Supabase CLI

```bash
# Pastikan Supabase CLI sudah ter-install
supabase db push --db-url "postgresql://..."

# Atau apply migration manual
supabase db reset
```

### Cara 3: Manual via Dashboard

#### A. Setup Storage Bucket

1. Pergi ke **Storage** di Supabase Dashboard
2. Jika bucket `payment-proofs` tidak ada, klik **New bucket**:
   - Name: `payment-proofs`
   - Public: **OFF** (harus private)
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

#### B. Setup Storage Policies

Di **Storage** → pilih bucket `payment-proofs` → **Policies**:

**1. INSERT Policy - "Users can upload their own payment proofs"**

```sql
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**2. SELECT Policy (User) - "Users can view their own payment proofs"**

```sql
CREATE POLICY "Users can view their own payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**3. SELECT Policy (Admin) - "Admins can view all payment proofs"**

```sql
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**4. UPDATE Policy - "Users can update their own payment proofs"**

```sql
CREATE POLICY "Users can update their own payment proofs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**5. DELETE Policy - "Users can delete their own payment proofs"**

```sql
CREATE POLICY "Users can delete their own payment proofs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### C. Setup Table Enrollments Policy

Di **Authentication** → **Policies** → Table: `enrollments`:

**UPDATE Policy - "Users can update their own enrollments"**

```sql
CREATE POLICY "Users can update their own enrollments"
ON enrollments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## Verifikasi

Setelah setup, test upload dengan:

1. Login sebagai user biasa
2. Daftar ke kelas
3. Upload bukti pembayaran
4. Pastikan tidak ada error RLS

## File Structure Storage

Upload akan menggunakan structure:

```
payment-proofs/
  └── {user_id}/
      └── {enrollment_id}-{timestamp}.{ext}
```

Contoh:

```
payment-proofs/
  └── 550e8400-e29b-41d4-a716-446655440000/
      └── abc123-1709020800000.jpg
```

## Troubleshooting

### Error: "new row violates row-level security policy"

- **Penyebab**: RLS policies belum diset atau salah
- **Solusi**: Jalankan SQL migration di atas

### Error: "Bucket does not exist"

- **Penyebab**: Bucket belum dibuat
- **Solusi**: Buat bucket `payment-proofs` via Dashboard

### Error: "Failed to get signed URL"

- **Penyebab**: Bucket adalah public atau URL generation failed
- **Solusi**: Pastikan bucket adalah private dan file sudah ter-upload

### Upload berhasil tapi tidak bisa lihat gambar

- **Penyebab**: Signed URL expired atau policy SELECT tidak ada
- **Solusi**: Add SELECT policy untuk admin di PaymentVerification component

## Notes

- ✅ Format yang diterima: JPEG, PNG, WebP
- ✅ Ukuran maksimal: 5MB
- ✅ Bucket adalah **private** (bukan public)
- ✅ Menggunakan signed URLs dengan expiry 10 tahun
- ✅ User hanya bisa upload ke folder mereka sendiri
- ✅ Admin bisa melihat semua payment proofs
