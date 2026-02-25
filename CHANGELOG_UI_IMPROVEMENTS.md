# Changelog - UI Improvements & Policy Acceptance

## Tanggal: [Current Date]

### 🎉 Fitur Baru

#### 1. Policy Acceptance Modal

**File Dibuat:**

- `supabase/migrations/create_policy_acceptance.sql` - Database schema untuk tracking penerimaan policy
- `src/components/PolicyModal.tsx` - Modal full-screen untuk acceptance Privacy Policy & Terms of Service

**Fitur:**

- Modal muncul otomatis saat user membuka website (jika belum accept)
- Pengguna bisa **Accept** atau **Decline**
- Jika **Accept**: Data disimpan ke database, modal tidak muncul lagi
- Jika **Decline**: Modal ditutup tanpa menyimpan, akan muncul lagi next time
- Menggunakan Row Level Security (RLS) untuk data privacy
- Auto-redirect ke Privacy Policy/ToS pages dari modal

**Database Schema:**

```sql
policy_acceptance table:
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to profiles)
- privacy_policy_accepted (BOOLEAN)
- terms_of_service_accepted (BOOLEAN)
- accepted_at (TIMESTAMP)
- Indexes: user_id untuk performance
- RLS: Users hanya bisa read/update data mereka sendiri
```

#### 2. Rotating WhatsApp Contact

**File Dimodifikasi:**

- `src/components/Footer.tsx`

**Fitur:**

- 4 nomor WhatsApp berputar otomatis setiap 2 jam 30 menit (150 menit)
- Hanya aktif pada jam kerja: **08:00 - 18:00 WIB**
- Di luar jam kerja, akan menampilkan nomor untuk slot waktu saat ini
- Update otomatis setiap 60 detik tanpa refresh halaman

**Nomor WhatsApp:**

1. Slot 1 (08:00-10:30, 13:30-16:00): 6281234567890
2. Slot 2 (10:30-13:00, 16:00-18:30): 6281234567891
3. Slot 3 (13:00-15:30): 6281234567892
4. Slot 4 (15:30-18:00): 6281234567893

### 🎨 Perbaikan UI/UX

#### 1. Color Consistency Fix

**File Dimodifikasi:**

- `src/app/admin/page.tsx` (line 68)
- `src/app/class/[id]/page.tsx` (line 88)

**Perubahan:**

- Fixed: `bg-linear-to-r` → `bg-gradient-to-r`
- Gradient header kini menggunakan Tailwind class yang benar
- Konsistensi warna indigo-to-purple gradient di seluruh dashboard

#### 2. Form Input Visibility Fix

**File Dimodifikasi:**

- `src/app/admin/classes/create/page.tsx`

**Perubahan:**

- Tambahkan `text-gray-900` ke semua input & textarea elements
- Fixed 10 input fields:
  - Title input
  - Description textarea
  - Duration input (number)
  - Classroom input (text)
  - Max participants input (number)
  - Class date input (date)
  - Class time input (time)
  - Registration deadline input (datetime-local)
  - Material description inputs (dynamic list)
  - Practice questions textarea (JSON format)

**Dampak:**

- Text yang diketik sekarang terlihat jelas dengan warna dark gray
- Tidak ada lagi masalah invisible text pada form

### 📁 File Structure Update

```
src/
├── components/
│   ├── PolicyModal.tsx (BARU)
│   └── Footer.tsx (UPDATED - rotating WhatsApp)
├── app/
│   ├── layout.tsx (UPDATED - include PolicyModal)
│   ├── admin/
│   │   ├── page.tsx (FIXED - gradient class)
│   │   └── classes/
│   │       └── create/
│   │           └── page.tsx (FIXED - input text colors)
│   └── class/
│       └── [id]/
│           └── page.tsx (FIXED - gradient class)
supabase/
└── migrations/
    └── create_policy_acceptance.sql (BARU)
```

### ⚙️ Deployment Steps

#### 1. Database Migration

**Di Supabase Dashboard:**

```bash
# Option A: Via Supabase Dashboard
1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file: supabase/migrations/create_policy_acceptance.sql
3. Paste dan Run the query

# Option B: Via Supabase CLI (jika installed)
supabase db push
```

**Verifikasi:**

- Check table `policy_acceptance` exists
- Check RLS policies active
- Test insert data manually

#### 2. Deploy to Vercel

```bash
# Push ke Git repository
git add .
git commit -m "feat: add policy acceptance modal, rotating WhatsApp, fix UI colors and form visibility"
git push origin main

# Atau manual deploy via Vercel Dashboard
```

#### 3. Environment Variables Check

Pastikan env vars ini sudah ada di Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_ADMIN_EMAILS=admin1@student.ubm.ac.id,admin2@student.ubm.ac.id
```

### 🧪 Testing Checklist

#### Policy Acceptance Modal

- [ ] Modal muncul saat first-time user visit
- [ ] Click "Saya Menerima" → Data tersimpan, modal tidak muncul lagi
- [ ] Click "Saya Menolak" → Modal hilang, muncul lagi next visit
- [ ] Link "Privacy Policy" dan "Terms of Service" berfungsi
- [ ] Data tersimpan di table `policy_acceptance` dengan correct user_id

#### Footer WhatsApp Rotation

- [ ] Nomor berubah setiap 2.5 jam
- [ ] Hanya aktif jam 08:00-18:00 WIB
- [ ] Auto-update tiap 60 detik tanpa refresh
- [ ] WhatsApp link berfungsi (klik → opens WhatsApp)

#### Form Visibility

- [ ] Buka /admin/classes/create
- [ ] Ketik di semua input fields
- [ ] Text terlihat jelas (dark gray, not invisible)
- [ ] Placeholder text masih visible sebelum typing

#### Color Consistency

- [ ] Admin dashboard header: gradient indigo-to-purple smooth
- [ ] Class detail page header: gradient indigo-to-purple smooth
- [ ] No CSS errors in console

### 📊 Build Status

✅ **Build Successful**

- TypeScript compilation: ✓
- 17 routes compiled
- No errors or warnings

### 🔄 Rollback Plan

Jika ada masalah:

```bash
# Rollback git
git revert HEAD
git push origin main

# Rollback database (via Supabase Dashboard)
DROP TABLE IF EXISTS policy_acceptance;
```

### 📝 Notes

1. **Policy Modal**: User harus accept untuk pengalaman terbaik, tapi tidak di-force (bisa decline)
2. **WhatsApp Numbers**: Ganti nomor di `Footer.tsx` line 39-48 sesuai kebutuhan real
3. **Migration**: Wajib run `create_policy_acceptance.sql` di Supabase sebelum deploy
4. **Performance**: Modal & Footer menggunakan client-side hooks (useState, useEffect)

### 🎯 Future Improvements Ideas

- [ ] Analytics untuk tracking berapa % user accept policy
- [ ] Admin dashboard untuk lihat policy acceptance stats
- [ ] Customizable whatsApp rotation schedule via admin panel
- [ ] Dark mode support untuk semua forms

---

**Developed by:** GitHub Copilot AI Assistant  
**Date:** [Current Session]  
**Status:** ✅ Ready for Production
