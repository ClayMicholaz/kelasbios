# Dashboard & Admin Features - Penjelasan Lengkap

## Status Saat Ini (February 25, 2026)

### ✅ Yang Sudah Berfungsi:

#### 1. **Navbar**

- Tombol "Masuk dengan Google UBM" sudah berfungsi dengan baik
- Loading state (`bg-primary-700/50 animate-pulse`) muncul singkat saat mengecek status login
- Setelah login, tombol berubah menjadi nama user + tombol "Keluar"
- **Catatan**: Loading state terlihat seperti "tombol kosong" karena memang sedang loading, ini normal dan hanya beberapa detik

#### 2. **Auto-Redirect untuk Admin**

- Admin yang login akan otomatis redirect dari `/dashboard` ke `/admin`
- Member tetap di `/dashboard`
- Sudah diimplementasikan di `src/app/dashboard/page.tsx`

#### 3. **Admin Dashboard** (`/admin`)

Fitur yang sudah ada:

- ✅ **Statistics Dashboard**
  - Total kelas
  - Pending verifikasi
  - Total member
  - Total enrolled
- ✅ **Quick Actions**
  - Buat kelas baru (`/admin/classes/create`)
  - Kelola kelas (`/admin/classes`)
  - Verifikasi pembayaran (`/admin/payments`)

- ✅ **Class Management**
  - Create class dengan form lengkap:
    - Nama kelas
    - Deskripsi
    - Durasi (jam)
    - Ruang kelas
    - Max participants (20-25 default, bisa disesuaikan)
    - Tanggal kelas
    - Jam kelas
    - Deadline pendaftaran
- ✅ **Payment Verification**
  - Lihat semua pending payments
  - Approve/reject payment
  - Lihat bukti transfer

- ✅ **Attendance Management**
  - Admin bisa mark attendance di halaman class detail
  - Centang mahasiswa yang hadir

#### 4. **Member Dashboard** (`/dashboard`)

Fitur yang sudah ada:

- ✅ **Overview Stats**
  - Kelas aktif
  - Menunggu verifikasi
  - Total kelas terdaftar

- ✅ **Enrollment Management**
  - Lihat semua kelas yang didaftar
  - Status pembayaran (pending/verified/rejected)
  - Upload bukti pembayaran
  - Re-upload jika ditolak

- ✅ **Class Materials**
  - Akses materi kelas setelah payment verified
  - Download PDF materials
  - Lihat practice questions

#### 5. **Database Schema**

- ✅ Profiles table (dengan NIM field)
- ✅ Classes table
- ✅ Enrollments table
- ✅ Storage buckets:
  - payment-proofs (bukti transfer)
  - class-materials (PDF dan materials)

---

## 🔧 Yang Perlu Anda Lakukan:

### 1. **Update Database Schema** (PENTING!)

Jalankan migration SQL berikut di Supabase SQL Editor:

```sql
-- Add NIM column to profiles table if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nim VARCHAR(20);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_nim ON profiles(nim);

-- Update existing users to extract NIM from email
UPDATE profiles
SET nim = substring(email FROM '\d{8}')
WHERE nim IS NULL OR nim = '';

-- Update handle_new_user function to auto-extract NIM
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_nim TEXT;
BEGIN
  -- Extract NIM from email (e.g., s32230111@student.ubm.ac.id -> 32230111)
  extracted_nim := substring(NEW.email FROM '\d{8}');

  INSERT INTO profiles (id, email, full_name, nim, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    extracted_nim,
    'member'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. **Verifikasi Admin Email di Vercel**

Pastikan environment variable sudah benar:

```
NEXT_PUBLIC_ADMIN_EMAILS=admin@student.ubm.ac.id,s32230111@student.ubm.ac.id
```

**Cara cek:**

1. Buka Vercel Dashboard
2. Pilih project kelasbios
3. Settings → Environment Variables
4. Pastikan `NEXT_PUBLIC_ADMIN_EMAILS` ada dan formatnya benar (tanpa spasi setelah koma)
5. **PENTING**: Redeploy setelah update

### 3. **Test Flow Admin**

Setelah setup:

1. Logout dari aplikasi
2. Login kembali dengan `s32230111@student.ubm.ac.id`
3. Anda akan otomatis redirect ke `/admin`
4. Cek role di database: `SELECT * FROM profiles WHERE email = 's32230111@student.ubm.ac.id';`
   - Role harus `admin`

---

## 📋 Cara Menggunakan Fitur-Fitur:

### Sebagai Admin:

#### 1. **Membuat Kelas Baru**

1. Login sebagai admin
2. Klik "Buat Kelas Baru" atau navigasi ke `/admin/classes/create`
3. Isi form:
   - **Judul Kelas**: Nama kelas (misal: "Web Development Fundamentals")
   - **Deskripsi**: Penjelasan lengkap kelas
   - **Durasi**: 2 jam (default)
   - **Ruang Kelas**: Misal "LAB 301"
   - **Max Peserta**: 20-25 (sesuai kebutuhan)
   - **Tanggal Kelas**: Pilih tanggal
   - **Jam Kelas**: Pilih jam
   - **Deadline Pendaftaran**: Kapan terakhir bisa daftar
4. Klik "Buat Kelas"

#### 2. **Verifikasi Pembayaran**

1. Buka `/admin/payments`
2. Lihat semua pending payments
3. Klik "Lihat Bukti" untuk melihat screenshot transfer
4. Klik "Verifikasi" untuk approve
5. Atau klik "Tolak" jika bukti tidak valid

#### 3. **Manage Attendance**

1. Buka `/admin/classes`
2. Klik kelas yang ingin di-manage
3. Di halaman detail, ada daftar peserta verified
4. Centang checkbox "Hadir" untuk mahasiswa yang datang
5. System otomatis save attendance

#### 4. **Upload Class Materials**

Upload materi PDF:

1. Buka class detail
2. Section "Materials"
3. Upload PDF file
4. File akan tersimpan di Supabase Storage
5. Hanya mahasiswa yang enrolled & verified yang bisa download

### Sebagai Member:

#### 1. **Mendaftar Kelas**

1. Browse kelas di homepage
2. Klik "Lihat Detail"
3. Klik "Daftar Kelas"
4. Upload bukti transfer (screenshot)
5. Tunggu admin verifikasi

#### 2. **Mengecek Status Pembayaran**

1. Login dan buka `/dashboard`
2. Lihat di section:
   - **Menunggu Verifikasi**: Pembayaran pending
   - **Pembayaran Ditolak**: Perlu upload ulang
   - **Kelas Saya**: Sudah verified

#### 3. **Download Materi**

1. Setelah payment verified
2. Buka dashboard
3. Klik "Lihat Materi & Latihan" pada kelas
4. Download PDF materials
5. Lihat practice questions

---

## 🐛 Troubleshooting:

### "Tombol Login terlihat loading terus"

- **Penyebab**: Browser cache atau slow network
- **Solusi**:
  1. Hard refresh (Ctrl + Shift + R)
  2. Clear browser cache
  3. Cek console browser untuk error

### "Saya admin tapi tidak bisa akses /admin"

- **Checklist**:
  1. ✅ Email sudah di `NEXT_PUBLIC_ADMIN_EMAILS` di Vercel?
  2. ✅ Sudah redeploy setelah update env var?
  3. ✅ Sudah logout dan login ulang?
  4. ✅ Role di database sudah `admin`?
- **Debug**:

  ```sql
  -- Cek role di Supabase SQL Editor
  SELECT email, role FROM profiles WHERE email = 'your-email@student.ubm.ac.id';

  -- Manual update role jika perlu (sementara)
  UPDATE profiles SET role = 'admin' WHERE email = 'your-email@student.ubm.ac.id';
  ```

### "Member masih bisa akses /admin"

- Protection sudah ada di middleware
- Jika masih bisa, cek RLS policies di Supabase
- Pastikan middleware.ts aktif

### "NIM tidak muncul"

- Jalankan migration SQL yang ada di section "Update Database Schema"
- Atau manual update:
  ```sql
  UPDATE profiles
  SET nim = substring(email FROM '\d{8}')
  WHERE id = 'your-user-id';
  ```

---

## 📊 Database Schema Summary:

```sql
-- profiles table
id          UUID (PK)
email       TEXT (UNIQUE)
full_name   TEXT
nim         VARCHAR(20)  -- ⭐ NEWLY ADDED
role        TEXT (member/admin)
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ

-- classes table
id                      UUID (PK)
title                   TEXT
description             TEXT
duration_hours          DECIMAL
classroom               TEXT
max_participants        INTEGER (default 20-25)
class_date              DATE
class_time              TIME
registration_deadline   TIMESTAMPTZ
materials               JSONB (array of materials)
practice_questions      JSONB
status                  TEXT (open/closed/completed)
created_by              UUID (FK to profiles)
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ

-- enrollments table
id              UUID (PK)
user_id         UUID (FK to profiles)
class_id        UUID (FK to classes)
payment_status  TEXT (pending/verified/rejected)
payment_proof   TEXT (URL to storage)
payment_date    TIMESTAMPTZ
verified_by     UUID (FK to profiles - admin who verified)
verified_at     TIMESTAMPTZ
attended        BOOLEAN (for attendance marking)
attended_at     TIMESTAMPTZ
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

---

## 🎯 Fitur yang Sudah Lengkap:

✅ Admin dapat membuat kelas baru
✅ Admin dapat verifikasi pembayaran
✅ Admin dapat mark attendance
✅ Member dapat mendaftar kelas
✅ Member dapat upload bukti pembayaran
✅ Member dapat download materi setelah verified
✅ Otomatis extract NIM dari email
✅ Nama dan NIM read-only (diambil dari profile)
✅ Max participants enforcement (20-25)
✅ Auto-redirect admin ke /admin dashboard
✅ Storage untuk payment proofs dan class materials
✅ Row Level Security (RLS) policies

---

## 🚀 Next Steps (Opsional - Enhancement):

1. **Email Notifications**
   - Kirim email saat payment verified/rejected
   - Reminder H-1 kelas dimulai

2. **Advanced Materials**
   - Video support (selain PDF)
   - Interactive quizzes
   - Progress tracking

3. **Analytics**
   - Class attendance statistics
   - Member engagement metrics
   - Payment trends

4. **Mobile Responsive Enhancement**
   - PWA support
   - Better mobile UX

---

**Dokumentasi dibuat**: February 25, 2026
**Status**: Sistem sudah fully functional, tinggal run migration NIM
