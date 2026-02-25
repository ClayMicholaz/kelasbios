# 🐛 Fix: NIM dan Role "not set"

## ❌ Masalah yang Ditemukan

### 1. Format NEXT_PUBLIC_ADMIN_EMAILS Salah

Di file `.env`, ada **SPASI setelah koma**:
```env
# ❌ SALAH - Ada spasi setelah beberapa koma
NEXT_PUBLIC_ADMIN_EMAILS=email1@student.ubm.ac.id,email2@student.ubm.ac.id, email3@student.ubm.ac.id
```

Ini menyebabkan parsing email gagal, sehingga:
- ✅ `email1@student.ubm.ac.id` → Detected (no space)
- ✅ `email2@student.ubm.ac.id` → Detected (no space)  
- ❌ ` email3@student.ubm.ac.id` → NOT detected (ada spasi di depan!)

### 2. Server Belum Restart Setelah Edit .env

Environment variables hanya dibaca saat server start. Jika Anda edit `.env` tapi tidak restart server, perubahan tidak akan ter-apply.

---

## ✅ Solusi

### STEP 1: Fix File .env

File sudah diperbaiki otomatis. Format yang benar:
```env
# ✅ BENAR - Tidak ada spasi, semua dalam satu baris
NEXT_PUBLIC_ADMIN_EMAILS=s32230111@student.ubm.ac.id,s32240127@student.ubm.ac.id,s32230123@student.ubm.ac.id,s32230130@student.ubm.ac.id,s32240207@student.ubm.ac.id,s32230099@student.ubm.ac.id
```

**Poin Penting:**
- ✅ Tidak ada spasi setelah koma
- ✅ Tidak ada line break (semua dalam 1 baris)
- ✅ Tidak ada trailing koma di akhir

### STEP 2: Restart Development Server

**PENTING:** Anda HARUS restart server agar perubahan .env ter-apply!

```bash
# 1. Stop server yang sedang running
# Tekan Ctrl+C di terminal

# 2. Start lagi
npm run dev
```

### STEP 3: Logout dan Login Ulang

Setelah server restart:

1. **Logout dari aplikasi:**
   - Klik foto profile → Keluar

2. **Clear browser cache:**
   - Tekan `Ctrl+Shift+Delete`
   - Clear cache & cookies
   - Atau gunakan Incognito window

3. **Login kembali:**
   - Login dengan akun yang ada di admin emails list
   - Perhatikan console logs

4. **Check profile dropdown:**
   - Klik foto profile
   - Role seharusnya sudah muncul: "admin"
   - NIM seharusnya sudah terisi

---

## 🔍 Debugging - Check Console Logs

Setelah login ulang, check browser console (F12):

```
[Navbar] Profile data: {
  id: "...",
  email: "s32230111@student.ubm.ac.id",
  full_name: "Your Name",
  nim: "32230111",        // ← Harus terisi
  role: "admin",          // ← Harus "admin" bukan null
  created_at: "...",
  updated_at: "..."
}
```

Jika masih `role: null` atau `nim: null`, lanjut ke Step 4.

---

## 🗄️ STEP 4: Check Database (Jika Masih Bermasalah)

### A. Buka Supabase Dashboard

1. Login ke: https://app.supabase.com/
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy & paste query dari file: `CHECK_PROFILES.sql`
5. Run query untuk melihat data profiles

### B. Check Profiles Data

Query akan menampilkan:
- ✅ Semua profiles yang ada
- ❌ Profiles dengan role/nim NULL
- 📊 Count profiles by role

### C. Manual Update (Jika Data Hilang)

Jika profile Anda tidak ada atau datanya NULL, update manual:

```sql
-- Ganti dengan email dan data Anda
UPDATE profiles 
SET 
  role = 'admin',
  nim = '32230111',
  full_name = 'Your Full Name'
WHERE email = 's32230111@student.ubm.ac.id';
```

---

## 🔄 Cara Kerja Auto-Assign Admin

### Di Middleware (proxy.ts)

Setiap kali user mengakses halaman, middleware akan:

```typescript
// 1. Get admin emails from env
const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(email => email.trim());

// 2. Check if user email is in admin list
if (adminEmails.includes(user.email)) {
  // 3. Update profile role to admin
  await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);
}
```

**Catatan:** `.trim()` digunakan untuk menghilangkan spasi, tapi lebih baik tidak ada spasi dari awal!

### Di Callback (auth/callback/page.tsx)

Saat pertama kali login dengan Google:

```typescript
// 1. Extract NIM from email
const emailPrefix = user.email.split("@")[0]; // "s32230111"
const nimMatch = emailPrefix.match(/\d{8}/);  // Find 8 digits
const nim = nimMatch ? nimMatch[0] : "";      // "32230111"

// 2. Check if email is admin
const isAdmin = adminEmails.includes(user.email);

// 3. Create profile with role and nim
await supabase.from("profiles").insert({
  id: user.id,
  email: user.email,
  full_name: user.user_metadata.full_name,
  nim: nim,
  role: isAdmin ? "admin" : "member"
});
```

---

## ✅ Verification Checklist

Setelah fix, verify:

- [ ] File `.env` sudah diperbaiki (no spaces after commas)
- [ ] Server sudah direstart (`npm run dev`)
- [ ] Sudah logout dan login ulang
- [ ] Browser cache sudah di-clear
- [ ] Console log menunjukkan profile dengan role dan nim terisi
- [ ] Dropdown profile menunjukkan "Role: admin" dan "NIM: 32230111"
- [ ] Menu "Admin" muncul di navbar

---

## 🎯 Quick Fix Commands

```bash
# 1. Stop server
# Ctrl+C

# 2. Restart server
npm run dev

# 3. Open browser
# http://localhost:3000

# 4. Logout & Login ulang
# Clear cache (Ctrl+Shift+Delete)
```

---

## 📞 Masih Bermasalah?

Jika setelah semua langkah di atas masih "not set":

1. **Screenshot console logs** (saat login)
2. **Screenshot dropdown profile** (showing "not set")
3. **Run query di Supabase** (`CHECK_PROFILES.sql`)
4. **Screenshot hasil query**
5. Share untuk troubleshooting lebih lanjut

---

## 🔧 File yang Sudah Diperbaiki

- ✅ `.env` - Format ADMIN_EMAILS diperbaiki (no spaces)
- 📄 `CHECK_PROFILES.sql` - Query untuk check database

Next step: **RESTART SERVER!** 🚀
