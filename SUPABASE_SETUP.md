# 🚀 Setup Database untuk BIOS LMS

## ❌ Error: "Database error saving new user"

Error ini terjadi karena **database schema belum dikonfigurasi** dengan benar. Ikuti langkah-langkah berikut untuk memperbaiki.

---

## 📋 Langkah-Langkah Setup

### 1. Buka Supabase SQL Editor

1. Pergi ke: https://app.supabase.com/
2. Login dan pilih project Anda: `ezcpwobnfntjfrytaorq`
3. Di sidebar kiri, klik **"SQL Editor"**

### 2. Jalankan Initial Setup Migration

Copy **SELURUH ISI** file `supabase/migrations/00_initial_setup.sql` dan paste ke SQL Editor, kemudian klik **"Run"**.

File ini akan:

- ✅ Membuat tabel `profiles` untuk menyimpan data user
- ✅ Membuat tabel `classes` untuk kelas-kelas
- ✅ Membuat tabel `enrollments` untuk pendaftaran
- ✅ Setup Row Level Security (RLS) policies
- ✅ Membuat storage buckets untuk payment proofs dan materials
- ✅ Setup triggers untuk auto-update timestamps

### 3. Verifikasi Setup

Setelah run migration, verifikasi dengan query ini di SQL Editor:

```sql
-- Cek apakah tabel sudah dibuat
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Output yang diharapkan:**

- `profiles`
- `classes`
- `enrollments`

### 4. Cek RLS (Row Level Security)

```sql
-- Pastikan RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Semua tabel harus memiliki `rowsecurity = true`.

### 5. Setup Google OAuth

Setelah database siap, konfigurasi Google OAuth:

#### A. Google Cloud Console

1. Pergi ke: https://console.cloud.google.com/
2. Pilih/Buat project "BIOS LMS"
3. Enable **Google+ API**
4. Buat **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://ezcpwobnfntjfrytaorq.supabase.co/auth/v1/callback
     ```
5. **Simpan Client ID dan Client Secret**

#### B. Supabase Dashboard

1. Dashboard > Authentication > Providers
2. Enable **Google** provider
3. Masukkan:
   - **Client ID**: dari Google Cloud Console
   - **Client Secret**: dari Google Cloud Console
4. Di Authentication > URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. **Save**

### 6. Test Login

1. Restart dev server: `npm run dev`
2. Buka: http://localhost:3000/auth/login
3. Klik "Masuk dengan Google UBM"
4. Login dengan akun @student.ubm.ac.id
5. **Buka Console (F12)** untuk melihat log

**Expected log:**

```
Starting OAuth callback...
Exchanging code for session...
Session created: {...}
User data: {...}
Creating new profile...
Profile created successfully: {...}
Redirecting to dashboard...
```

### 7. Verifikasi Data di Database

Di Supabase Dashboard > Table Editor > profiles, seharusnya ada data baru:

- `id`: User UUID
- `email`: your-email@student.ubm.ac.id
- `full_name`: Nama dari Google
- `nim`: 8 digit NIM (extracted dari email)
- `role`: "member" atau "admin"

---

## 🔧 Troubleshooting

### Error: "relation profiles does not exist"

**Solusi**: Belum run migration. Jalankan `00_initial_setup.sql` di SQL Editor.

### Error: "duplicate key value violates unique constraint"

**Solusi**: User sudah ada di auth.users tapi tidak ada di profiles. Hapus user di Authentication > Users, lalu coba login lagi.

### Error: "new row violates row-level security policy"

**Solusi**: RLS policy terlalu ketat. Pastikan policy "Enable insert for authenticated users during signup" sudah dibuat.

### User tidak masuk ke tabel profiles

**Solusi**:

1. Cek browser console untuk error detail
2. Pastikan callback URL sudah benar di Google OAuth settings
3. Verifikasi RLS policies dengan query:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Masih diminta login setelah berhasil authenticate

**Solusi**:

1. Clear browser cookies
2. Restart dev server
3. Pastikan Supabase URL dan Anon Key di `.env` sudah benar

---

## 📞 Need Help?

Jika masih ada masalah:

1. ✅ Screenshot error di browser console
2. ✅ Screenshot error di Supabase Logs (Dashboard > Logs)
3. ✅ Verify Google OAuth settings di Google Cloud Console dan Supabase

**Struktur tabel yang benar:**

```sql
-- profiles table
id (UUID, Primary Key)
email (VARCHAR)
full_name (VARCHAR)
nim (VARCHAR)
role (VARCHAR: 'admin' or 'member')
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```
