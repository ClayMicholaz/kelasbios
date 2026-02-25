# 🚀 Quick Start Guide - Kelas BIOS

## Prerequisites

- Node.js 18+ installed
- npm atau yarn package manager
- Supabase account (untuk database)

## 🔧 Setup Pertama Kali

### 1. Clone Repository

```bash
git clone <repository-url>
cd kelasbios
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Emails (pisahkan dengan koma)
NEXT_PUBLIC_ADMIN_EMAILS=admin1@student.ubm.ac.id,admin2@student.ubm.ac.id

# Google OAuth (optional, jika ingin custom)
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

### 4. Setup Database

Jalankan migrations di Supabase SQL Editor:

```bash
# Lihat file migrations di folder: supabase/migrations/
```

### 5. Start Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

---

## ⚠️ Troubleshooting

### Error: "Unable to acquire lock"

Jika melihat error:

```
⨯ Unable to acquire lock at .next\dev\lock
```

**Solusi Otomatis:**

```bash
npm run clean-dev
```

**Solusi Manual:**

```powershell
# 1. Stop semua Node.js processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 2. Hapus .next folder
Remove-Item .\.next\dev -Recurse -Force

# 3. Jalankan ulang
npm run dev
```

### Port 3000 Sudah Digunakan

Jika port 3000 sudah digunakan, Next.js otomatis akan menggunakan port lain (3001, 3002, dst).

Atau, stop proses yang menggunakan port 3000:

```powershell
# Cari process ID
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Stop process (ganti PID dengan ID yang ditemukan)
Stop-Process -Id <PID> -Force
```

### Error TypeScript

```bash
# Hapus cache dan rebuild
Remove-Item .\.next -Recurse -Force
npm run build
```

---

## 📝 Development Workflow

### 1. Membuat Fitur Baru

```bash
# 1. Buat branch baru
git checkout -b feature/nama-fitur

# 2. Coding...

# 3. Test lokal
npm run dev

# 4. Build production test
npm run build

# 5. Push
git add .
git commit -m "feat: deskripsi fitur"
git push origin feature/nama-fitur
```

### 2. Struktur Folder Penting

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Member dashboard
│   └── class/[id]/        # Class detail pages
├── components/            # Reusable components
├── lib/                   # Utilities & helpers
│   └── supabase/         # Supabase clients
└── types/                # TypeScript types
```

### 3. Database Schema

Lihat dokumentasi lengkap di: `DATABASE_SCHEMA.md`

### 4. Deployment

**Vercel (Recommended):**

```bash
# Push ke GitHub, Vercel otomatis deploy
git push origin main
```

**Manual:**

```bash
npm run build
npm start
```

---

## 🎯 Fitur Utama

- ✅ **Authentication**: Google OAuth (@student.ubm.ac.id)
- ✅ **Class Management**: Admin bisa buat dan manage kelas
- ✅ **Payment Verification**: Admin verifikasi pembayaran member
- ✅ **Attendance**: Admin bisa absensi peserta
- ✅ **Materials**: Upload PDF dan materi pembelajaran
- ✅ **Practice Quiz**: Soal latihan dengan JSON format
- ✅ **Member Dashboard**: Lihat kelas yang sudah dibayar

---

## 📖 Dokumentasi Lengkap

- [Database Schema](DATABASE_SCHEMA.md)
- [Supabase Setup](SUPABASE_SETUP.md)
- [Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [User Guide](USER_GUIDE.md)

---

## 🆘 Bantuan

Jika mengalami masalah:

1. Lihat error message di terminal
2. Check console browser (F12)
3. Coba `npm run clean-dev`
4. Check `.env.local` sudah benar
5. Pastikan Supabase database sudah running

---

## 📞 Contact

Untuk bantuan lebih lanjut, hubungi tim BIOS.

**Happy Coding! 🚀**
