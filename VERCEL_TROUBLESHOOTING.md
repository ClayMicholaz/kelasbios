# Troubleshooting Vercel Internal Server Error

## Langkah-langkah Memperbaiki Error

### 1. ✅ Sudah Diperbaiki
- [x] Ubah nama file `src/proxy.ts` menjadi `src/middleware.ts`
- [x] Ubah nama function dari `proxy` menjadi `middleware`
- [x] Hapus trailing comma di `NEXT_PUBLIC_ADMIN_EMAILS`

### 2. Cek Environment Variables di Vercel

Pastikan **SEMUA** environment variables berikut sudah ditambahkan:

1. Buka Vercel Dashboard → Pilih project → Settings → Environment Variables

2. Tambahkan variabel berikut untuk **Production**, **Preview**, DAN **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://ezcpwobnfntjfrytaorq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y3B3b2JuZm50amZyeXRhb3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzg1NTksImV4cCI6MjA4NjY1NDU1OX0.0TiHSwBwK1-TsgrTpxf3i7VKwl8uIDhBcQWyfh9BdbE
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@student.ubm.ac.id
NEXT_PUBLIC_ADMIN_EMAILS=admin@student.ubm.ac.id,s32230111@student.ubm.ac.id
NEXT_PUBLIC_BANK_NAME=Bank Jago
NEXT_PUBLIC_BANK_ACCOUNT_NAME=Christoper Harris
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=100271468145
```

**PENTING:** 
- Ganti `NEXT_PUBLIC_APP_URL` dengan URL Vercel Anda yang sebenarnya
- Jangan ada spasi setelah tanda sama dengan (=)
- Jangan ada trailing comma di akhir email list

### 3. Cara Melihat Error Logs di Vercel

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik tab **Deployments**
4. Klik pada deployment terakhir yang failed
5. Scroll ke bawah dan klik **View Function Logs** atau **Runtime Logs**
6. Copy error message yang muncul

### 4. Common Issues & Solutions

#### Issue: "NEXT_PUBLIC_SUPABASE_URL is undefined"
**Solution:** Environment variables belum ditambahkan atau salah scope (harus Production, Preview, Development)

#### Issue: "Failed to fetch" atau "Network error"
**Solution:** 
- Cek apakah Supabase project masih aktif
- Cek apakah URL dan ANON_KEY sudah benar
- Cek di Supabase Dashboard → Settings → API apakah REST API enabled

#### Issue: "Middleware error"
**Solution:** 
- Pastikan file `src/middleware.ts` ada (bukan `proxy.ts`)
- Pastikan function export adalah `middleware` (bukan `proxy`)

#### Issue: Error di RLS (Row Level Security)
**Solution:** 
- Pastikan RLS policies sudah disetup di Supabase
- Jalankan semua migrations di folder `supabase/migrations/`

### 5. Test Build Locally Dulu

Sebelum deploy, pastikan build berhasil di local:

```bash
# Clean build
rm -rf .next
npm run build

# Test production build
npm start
```

Jika ada error di local, perbaiki dulu sebelum deploy ke Vercel.

### 6. Force Redeploy

Setelah menambahkan/memperbaiki environment variables:

1. Di Vercel Dashboard → Deployments
2. Klik "..." di deployment terakhir
3. Pilih **Redeploy**
4. Atau push commit baru ke repository

### 7. Cek Supabase Allowed URLs

Di Supabase Dashboard:

1. Pergi ke Authentication → URL Configuration
2. Pastikan Vercel URL Anda ada di:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** Tambahkan:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**`

---

## Jika Masih Error

Silakan share informasi berikut:

1. **Error message dari Function Logs** (paling penting!)
2. Screenshot Environment Variables di Vercel (blur/censor sensitive values)
3. URL deployment yang error
4. Screenshot error yang muncul di browser (buka Chrome DevTools → Console)

Dengan informasi di atas, saya bisa memberikan solusi yang lebih spesifik.
