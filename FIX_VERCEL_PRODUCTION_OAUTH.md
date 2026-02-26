# 🔧 Fix: Vercel Production OAuth Error

## ❌ Error yang Muncul

```json
{
  "error": "requested path is invalid"
}
```

**URL yang salah:**

```
https://ezcpwobnfntjfrytaorq.supabase.co/kelasbios.vercel.app?code=...
```

**URL yang benar (expected):**

```
https://kelasbios.vercel.app/auth/callback?code=...
```

---

## 🔍 Root Cause

Supabase OAuth tidak tahu bahwa `kelasbios.vercel.app` adalah domain production yang valid. Redirect URL belum ditambahkan ke Supabase Authentication configuration.

---

## ✅ SOLUSI: Update Supabase Redirect URLs

### **Step 1: Buka Supabase Dashboard**

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **Authentication** (ikon kunci di sidebar)
4. Klik **URL Configuration**

---

### **Step 2: Update Redirect URLs**

Di bagian **Redirect URLs**, tambahkan:

```
https://kelasbios.vercel.app/auth/callback
```

**Screenshot location:**

```
Supabase Dashboard
└── Project: [Your Project]
    └── Authentication
        └── URL Configuration
            └── Redirect URLs (textarea)
```

**Expected value (comma-separated):**

```
http://localhost:3000/auth/callback,https://kelasbios.vercel.app/auth/callback
```

---

### **Step 3: Save & Test**

1. **Klik "Save"** di Supabase dashboard
2. **Clear browser cache** (Ctrl+Shift+Delete):
   - Cookies and site data
   - Cached images and files
3. **Test login** di production:
   - Buka https://kelasbios.vercel.app
   - Klik "Masuk dengan Google UBM"
   - Expected: OAuth flow berhasil, redirect ke /dashboard

---

## 🎯 Verifikasi Berhasil

### **1. Login Flow Works**

- ✅ Click "Masuk dengan Google UBM"
- ✅ Google OAuth consent screen muncul
- ✅ Setelah authorize, redirect ke `https://kelasbios.vercel.app/auth/callback?code=...`
- ✅ Callback route creates session & profile
- ✅ Redirect ke `/dashboard`
- ✅ Navbar shows profile (name, avatar, role)

### **2. Admin Check Works**

- ✅ Login dengan email di `NEXT_PUBLIC_ADMIN_EMAILS`
- ✅ Profile created dengan `role = 'admin'`
- ✅ Navbar shows "Admin" menu
- ✅ Can access `/admin` routes

### **3. Non-Admin Protection Works**

- ✅ Login dengan email BUKAN di admin list
- ✅ Profile created dengan `role = 'member'`
- ✅ Navbar TIDAK tampilkan "Admin" menu
- ✅ Manual access `/admin` → redirect ke `/403`

---

## 🔒 Optional: Update Site URL (Recommended)

Di **URL Configuration**, update juga:

**Site URL:**

```
https://kelasbios.vercel.app
```

Ini adalah base URL untuk production. Berguna untuk:

- Email templates (reset password, etc.)
- OAuth success redirects
- Default fallback URL

---

## 🚨 Troubleshooting

### **Error: "Email link is invalid or has expired"**

**Solusi:**

- Pastikan Redirect URLs di Supabase sudah include production domain
- Clear browser cookies dan cache
- Try login dari incognito/private window

---

### **Error: Still shows Supabase URL instead of domain**

**Checklist:**

1. ✅ Redirect URLs saved di Supabase dashboard?
2. ✅ Format correct: `https://kelasbios.vercel.app/auth/callback` (with /auth/callback)?
3. ✅ No typos di domain name?
4. ✅ Wait 1-2 menit untuk Supabase propagate changes

---

### **Error: "OAuth flow completed but profile not created"**

**Debug:**

1. Check Vercel Function Logs:
   - Vercel Dashboard → Functions → Runtime Logs
   - Look for "[Callback]" logs
   - Check for errors in profile creation

2. Check Supabase logs:
   - Supabase Dashboard → Logs → Postgres Logs
   - Filter by `profiles` table
   - Look for INSERT errors

---

## 📋 Quick Checklist

Before testing production OAuth:

- [ ] **Supabase Redirect URLs** sudah include production domain
- [ ] **Supabase Site URL** updated ke production URL
- [ ] **Vercel Environment Variables** sudah set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_ADMIN_EMAILS`
- [ ] **Vercel deployment** successful (no build errors)
- [ ] **Browser cache** cleared before testing

---

## 🎉 Expected Final Result

**Production Login Flow:**

```
User clicks → Google OAuth → Authorize
→ https://kelasbios.vercel.app/auth/callback?code=ABC123
→ Callback creates session + profile (with admin role if in list)
→ Redirect to /dashboard
→ User sees their profile in navbar
→ Admin users see "Admin" menu
```

**Admin Protection:**

```
Non-admin access /admin
→ Middleware checks role
→ Role ≠ "admin"
→ Redirect to /403
→ Shows "Akses Ditolak" page
```

---

**Last Updated:** Feb 26, 2026  
**Status:** Production OAuth misconfiguration  
**Priority:** CRITICAL - blocks all production logins
