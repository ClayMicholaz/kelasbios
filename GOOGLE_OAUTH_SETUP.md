# Google OAuth Setup Guide

Panduan ini akan membantu Anda mengkonfigurasi Google OAuth untuk BIOS LMS.

## Langkah 1: Buat Google OAuth Credentials

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan **Google+ API**:
   - Buka menu "APIs & Services" > "Library"
   - Cari "Google+ API"
   - Klik "Enable"

4. Buat OAuth 2.0 Client ID:
   - Buka menu "APIs & Services" > "Credentials"
   - Klik "CREATE CREDENTIALS" > "OAuth client ID"
   - Pilih "Web application"
   - Isi nama aplikasi (contoh: "BIOS LMS")
   - Tambahkan **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://kelasbios.vercel.app
     https://ezcpwobnfntjfrytaorq.supabase.co
     ```
   - Tambahkan **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     https://kelasbios.vercel.app/auth/callback
     https://ezcpwobnfntjfrytaorq.supabase.co/auth/v1/callback
     ```
   - Klik "Create"
   - **SIMPAN** Client ID dan Client Secret yang muncul

## Langkah 2: Configure di Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Pilih project Anda
3. Buka menu "Authentication" > "Providers"
4. Cari "Google" dan aktifkan toggle switch
5. Isi konfigurasi:
   - **Client ID**: Paste Client ID dari Google Cloud Console
   - **Client Secret**: Paste Client Secret dari Google Cloud Console
   - **Authorized Client IDs**: (kosongkan)
   - **Skip nonce check**: (tidak perlu dicentang)
6. Klik "Save"

## Langkah 3: Update Database Schema

Jalankan migration SQL berikut di Supabase SQL Editor:

\`\`\`sql
-- Add NIM column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nim VARCHAR(20);

-- Add index for NIM for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_nim ON profiles(nim);

-- Add comment to document the column
COMMENT ON COLUMN profiles.nim IS 'Nomor Induk Mahasiswa (Student ID Number) extracted from email';
\`\`\`

## Langkah 4: Test OAuth Flow

1. Jalankan aplikasi di localhost:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Buka halaman Register atau Login
3. Klik button "Masuk dengan Google UBM"
4. Login dengan akun Google @student.ubm.ac.id
5. Anda akan diredirect ke dashboard dengan profile yang sudah otomatis dibuat

## Cara Kerja Auto-Population

Ketika user login dengan Google OAuth:

1. **Full Name**: Diambil dari Google account (user_metadata.full_name atau user_metadata.name)
2. **NIM**: Diekstrak dari email menggunakan regex pattern untuk mencari tepat 8 digit angka
   - Contoh: `s32230111@student.ubm.ac.id` → NIM = `32230111`
   - Format email UBM: `s[8 digit NIM]@student.ubm.ac.id` atau `nama.s[8 digit NIM]@student.ubm.ac.id`
3. **Role**: Otomatis diset sebagai "admin" jika email ada di `NEXT_PUBLIC_ADMIN_EMAILS`

## Troubleshooting

### Error: "Origin not allowed"

- Pastikan origin Anda sudah ditambahkan di Google Cloud Console
- Restart development server setelah perubahan konfigurasi

### Error: "redirect_uri_mismatch"

- Periksa kembali Authorized redirect URIs di Google Cloud Console
- Pastikan tidak ada typo dan harus exact match dengan callback URL

### User email bukan @student.ubm.ac.id

- OAuth sudah dikonfigurasi dengan `hd: 'student.ubm.ac.id'` parameter
- Hanya email dengan domain tersebut yang akan diterima
- Middleware juga akan memvalidasi ulang dan logout jika domain tidak sesuai

### NIM tidak terdeteksi

- Pastikan format email mengikuti pattern standar UBM
- NIM harus berupa tepat 8 digit angka dalam email
- Format yang didukung:
  - `s32230111@student.ubm.ac.id` (langsung setelah huruf s)
  - `nama.s32230111@student.ubm.ac.id` (setelah titik dan huruf s)
  - `32230111@student.ubm.ac.id` (hanya angka)
- Jika format email berbeda, sesuaikan regex di `auth/callback/page.tsx` dan `auth/register/page.tsx`

## Security Notes

- Google OAuth credentials harus disimpan dengan aman
- Jangan commit Client Secret ke repository Git
- Gunakan environment variables untuk menyimpan credentials
- Aktifkan email confirmation untuk keamanan tambahan
- Restrict OAuth hanya untuk domain @student.ubm.ac.id

## Reference Links

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
