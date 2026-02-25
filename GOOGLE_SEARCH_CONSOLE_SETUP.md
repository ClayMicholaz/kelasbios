# 📊 Panduan Google Search Console - Verifikasi Kepemilikan Website

Tutorial lengkap untuk menambahkan dan memverifikasi website Anda di Google Search Console.

---

## 🎯 Apa itu Google Search Console?

Google Search Console adalah tool gratis dari Google yang membantu Anda:

- ✅ Monitor performa website di Google Search
- ✅ Melihat keyword apa yang membawa traffic
- ✅ Check indexing status halaman
- ✅ Detect dan fix SEO issues
- ✅ Submit sitemap

---

## 🚀 STEP 1: Buka Google Search Console

1. Pergi ke: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Login dengan akun Google Anda (akun pribadi atau @student.ubm.ac.id)
3. Anda akan melihat halaman awal Google Search Console

---

## ➕ STEP 2: Tambahkan Property Baru

Ada 2 jenis property yang bisa ditambahkan:

### Opsi A: Domain Property (Recommended untuk Custom Domain)

**Mencakup semua subdomain dan protokol (http, https, www, non-www)**

1. Klik **Add Property** (atau **+ Tambahkan Properti**)
2. Pilih tab **Domain**
3. Masukkan domain tanpa protocol:
   ```
   kelasbios.com
   ```
   (BUKAN https://kelasbios.com atau www.kelasbios.com)
4. Klik **Continue**
5. Anda akan diminta verifikasi via **DNS TXT record** (lihat metode di bawah)

### Opsi B: URL Prefix Property (Mudah untuk Vercel)

**Hanya untuk URL spesifik (termasuk protocol dan subdomain)**

1. Klik **Add Property** (atau **+ Tambahkan Properti**)
2. Pilih tab **URL prefix**
3. Masukkan URL lengkap dengan protocol:
   ```
   https://kelasbios.vercel.app
   ```
   atau
   ```
   https://www.kelasbios.com
   ```
4. Klik **Continue**
5. Anda akan melihat berbagai metode verifikasi

**💡 Rekomendasi**: Gunakan **URL Prefix** untuk Vercel domain (lebih mudah untuk verifikasi)

---

## ✅ STEP 3: Pilih Metode Verifikasi

Google Search Console menawarkan beberapa metode verifikasi:

### 📄 Metode 1: HTML Tag (RECOMMENDED - Paling Mudah)

**Cocok untuk:** Next.js, Vercel deployment

1. Di Google Search Console, pilih tab **HTML tag**
2. Anda akan melihat kode seperti ini:
   ```html
   <meta name="google-site-verification" content="abc123XYZ456..." />
   ```
3. **Copy** bagian `abc123XYZ456...` (kode di dalam `content="..."`)
4. Jangan klik Verify dulu! Lanjut ke Step 4 dulu.

5. Jangan klik Verify dulu! Lanjut ke Step 4 dulu.

### 📁 Metode 2: HTML File Upload

**Cocok untuk:** Static sites, debugging

1. Di Google Search Console, pilih tab **HTML file**
2. Download file HTML (contoh: `google1234567890abcdef.html`)
3. Upload file ke root website Anda
4. Verifikasi file bisa diakses di browser: `https://yourdomain.com/google1234567890abcdef.html`
5. Kembali ke Google Search Console, klik **Verify**

**Untuk Next.js (Vercel):**

- Taruh file di folder `public/`
- File akan otomatis tersedia di root URL

### 🌐 Metode 3: DNS Record (Untuk Custom Domain)

**Cocok untuk:** Domain custom dengan akses DNS settings

1. Di Google Search Console, pilih tab **DNS record**
2. Copy TXT record yang diberikan, contoh:
   ```
   google-site-verification=abc123XYZ456...
   ```
3. Login ke DNS provider Anda (Namecheap, GoDaddy, Cloudflare, dll)
4. Tambahkan TXT record:
   - **Type**: TXT
   - **Name**: @ (atau root/apex domain)
   - **Value**: `google-site-verification=abc123XYZ456...`
   - **TTL**: 3600 (atau default)
5. Save
6. Tunggu propagasi DNS (5 menit - 48 jam, biasanya 15-30 menit)
7. Verify di Google Search Console

**Check DNS propagasi:**

```bash
# Windows PowerShell
Resolve-DnsName -Name yourdomain.com -Type TXT

# atau gunakan online tool:
# https://dnschecker.org/
```

### 🔗 Metode 4: Google Analytics

**Cocok untuk:** Website yang sudah install Google Analytics

1. Pastikan website sudah punya Google Analytics tracking code
2. Gunakan **akun Google yang sama** untuk login ke GSC
3. Google akan otomatis detect dan verify

### 🏷️ Metode 5: Google Tag Manager

**Cocok untuk:** Website yang sudah install Google Tag Manager

1. Pastikan GTM snippet sudah di `<head>` website
2. Gunakan **akun Google yang sama** untuk login ke GSC
3. Google akan otomatis detect dan verify

---

## 🔧 STEP 4: Tambahkan Kode Verifikasi ke Next.js (Metode HTML Tag)

Jika Anda pilih **Metode 1: HTML Tag**, ikuti langkah ini:

### A. Edit File `layout.tsx`

1. Buka file: `src/app/layout.tsx`
2. Temukan bagian `metadata`:
   ```typescript
   export const metadata: Metadata = {
     title: "BIOS LMS - Learning Management System",
     description:
       "Platform pembelajaran eksklusif untuk mahasiswa Teknik Informatika UBM",
     verification: {
       google: "YOUR_GOOGLE_SEARCH_CONSOLE_CODE", // ← GANTI INI
     },
   };
   ```
3. Ganti `YOUR_GOOGLE_SEARCH_CONSOLE_CODE` dengan kode verifikasi Anda
4. **Contoh:**
   ```typescript
   verification: {
     google: "abc123XYZ456def789GHI", // Kode dari Google Search Console
   },
   ```

### B. Test di Localhost (Optional)

```bash
npm run dev
```

1. Buka: `http://localhost:3000`
2. Klik kanan → **View Page Source** (atau Ctrl+U)
3. Cari di `<head>`, pastikan ada:
   ```html
   <meta name="google-site-verification" content="abc123XYZ456..." />
   ```

---

## 🚀 STEP 5: Deploy ke Vercel

1. Commit perubahan:

   ```bash
   git add src/app/layout.tsx
   git commit -m "Add Google Search Console verification"
   git push
   ```

2. Vercel akan otomatis deploy (tunggu 1-2 menit)

3. **Verifikasi deployment:**
   - Buka production URL: `https://kelasbios.vercel.app`
   - View Page Source (Ctrl+U)
   - Pastikan meta tag sudah ada di `<head>`

---

## ✅ STEP 6: Verify di Google Search Console

1. Kembali ke tab Google Search Console (jangan refresh!)
2. Klik tombol **Verify** (berwarna biru)
3. Jika berhasil: ✅ **Ownership verified**
4. Klik **Go to property** untuk mulai gunakan GSC

**Jika gagal:** Lihat troubleshooting di bawah ⬇️

---

## 🎉 STEP 7: Submit Sitemap (Optional tapi Recommended)

Setelah verifikasi berhasil:

1. Di dashboard Google Search Console
2. Klik **Sitemaps** di sidebar kiri
3. Masukkan URL sitemap:
   ```
   sitemap.xml
   ```
   (Next.js biasanya generate otomatis di `/sitemap.xml`)
4. Klik **Submit**

**💡 Tip:** Jika belum punya sitemap, buat file `app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kelasbios.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://kelasbios.vercel.app/dashboard",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // tambahkan URL lainnya
  ];
}
```

---

## ❌ Troubleshooting

### Error: "Verification failed"

**Penyebab:**

- Meta tag belum di-deploy
- Cache browser/CDN
- Meta tag tidak di `<head>`
- Kode verifikasi salah

**Solusi:**

1. **Clear cache browser:**
   - Tekan Ctrl+Shift+Delete
   - Clear cache & cookies
   - Atau buka Incognito window

2. **Cek source code:**
   - Buka: `https://yourdomain.com`
   - View Page Source (Ctrl+U)
   - Cari `<meta name="google-site-verification"`
   - Pastikan kode match dengan yang di GSC

3. **Tunggu beberapa menit:**
   - Kadang perlu waktu untuk propagate
   - Coba verify lagi setelah 5-10 menit

4. **Gunakan metode alternatif:**
   - Coba metode HTML file upload
   - Atau DNS record (untuk custom domain)

### Error: "File not found" (Metode HTML File)

**Penyebab:**

- File tidak di folder `public/`
- Deploy belum selesai
- Typo di nama file

**Solusi:**

1. Pastikan file ada di: `public/google123....html`
2. Akses langsung di browser dulu sebelum verify
3. Check Vercel deployment logs

### DNS Verification Tidak Detect

**Penyebab:**

- DNS belum propagate
- TXT record format salah
- TTL terlalu tinggi

**Solusi:**

1. **Check DNS propagation:**
   - Gunakan: https://dnschecker.org/
   - Pilih TXT record
   - Masukkan domain Anda
   - Pastikan record sudah muncul globally

2. **Re-check TXT record format:**
   - Name: `@` (bukan `www` atau `*`)
   - Value harus FULL: `google-site-verification=abc123...`
   - Jangan tambah quotes atau tanda lain

3. **Tunggu lebih lama:**
   - Bisa sampai 24-48 jam untuk full propagation
   - Tapi biasanya 15-30 menit sudah cukup

### Vercel Domain vs Custom Domain

**Untuk Vercel domain (\*.vercel.app):**

- ✅ Gunakan **HTML tag** atau **HTML file**
- ❌ Jangan gunakan DNS method (Anda tidak punya akses ke DNS Vercel)

**Untuk Custom domain:**

- ✅ Semua metode bisa digunakan
- 🌟 **DNS method** paling recommended (verify sekali, berlaku untuk semua subdomain)

---

## 📊 Setelah Verifikasi Berhasil

Setelah property terverifikasi, Anda bisa:

1. **Monitor Search Performance:**
   - Lihat berapa kali website muncul di Google Search
   - Keyword apa yang banyak diklik
   - CTR (Click-Through Rate)

2. **Check Indexing:**
   - Halaman mana yang sudah di-index Google
   - Submit URL baru untuk di-index

3. **Fix Issues:**
   - Mobile usability issues
   - Core Web Vitals
   - Security issues

4. **View Sitemaps:**
   - Monitor sitemap submission status
   - Check coverage

---

## 🎯 Quick Reference

| Metode             | Cocok Untuk    | Difficulty      | Speed                  |
| ------------------ | -------------- | --------------- | ---------------------- |
| HTML Tag           | Next.js, React | ⭐ Easy         | ⚡ Fast (5 min)        |
| HTML File          | Static sites   | ⭐⭐ Medium     | ⚡ Fast (5 min)        |
| DNS Record         | Custom domain  | ⭐⭐⭐ Advanced | 🐢 Slow (30 min - 48h) |
| Google Analytics   | Sites with GA  | ⭐ Easy         | ⚡ Instant             |
| Google Tag Manager | Sites with GTM | ⭐ Easy         | ⚡ Instant             |

---

## 📚 Resources

- [Google Search Console](https://search.google.com/search-console)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Vercel Domains](https://vercel.com/docs/concepts/projects/domains)
- [DNS Checker](https://dnschecker.org/)

---

## 💡 Tips Pro

1. **Verify kedua versi (www & non-www):**
   - Add 2 properties: `https://kelasbios.com` dan `https://www.kelasbios.com`
   - Set preferred domain di settings

2. **Jangan hapus meta tag setelah verify:**
   - Google re-check secara berkala
   - Jika tag hilang, verifikasi bisa di-revoke

3. **Monitor weekly:**
   - Check search performance
   - Fix any issues yang muncul
   - Submit new content untuk indexing

4. **Enable email notifications:**
   - Settings → Users and permissions
   - Enable notifikasi untuk issues critical

---

Selesai! Website Anda sekarang sudah terverifikasi di Google Search Console. 🎉
