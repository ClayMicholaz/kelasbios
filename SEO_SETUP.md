# SEO Setup untuk BIOS LMS

## 📋 Ringkasan

Dokumen ini menjelaskan konfigurasi SEO yang telah ditambahkan untuk memaksimalkan visibilitas BIOS LMS di Google Search dan mesin pencari lainnya.

## ✅ Komponen SEO yang Telah Ditambahkan

### 1. **robots.txt** (`/public/robots.txt`)

File ini memberitahu search engine crawler halaman mana yang boleh dan tidak boleh diindeks.

**Konfigurasi:**

- ✅ Mengizinkan semua halaman publik (/, /class/\*, /privacy-policy, /terms-of-service)
- ❌ Memblokir halaman private (/dashboard, /admin, /auth/callback, /api/)
- 📍 Mengarahkan ke sitemap.xml

### 2. **Dynamic Sitemap** (`/src/app/sitemap.ts`)

Sitemap dinamis yang secara otomatis mengambil data kelas dari database.

**Fitur:**

- Halaman statis (beranda, privacy policy, terms of service, login)
- Halaman kelas dinamis dari database
- Priority dan change frequency untuk setiap halaman
- Last modified date untuk freshness

### 3. **Manifest.json** (`/public/manifest.json`)

Konfigurasi PWA (Progressive Web App) untuk instalasi aplikasi di mobile.

**Fitur:**

- Nama aplikasi dan deskripsi
- Icon dan screenshot
- Theme color (#1e3a8a - primary blue)
- Standalone display mode
- Bahasa Indonesia (id-ID)

### 4. **Enhanced Metadata** (`/src/app/layout.tsx`)

Metadata komprehensif di root layout untuk SEO global.

**Meliputi:**

- ✅ Title template dengan brand consistency
- ✅ Description yang detail dan keyword-rich
- ✅ Keywords array untuk search engines
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Google Search Console verification
- ✅ Robots directives
- ✅ Canonical URLs
- ✅ Multiple icons (favicon, apple-touch-icon, mask-icon)
- ✅ Theme color untuk mobile browsers
- ✅ PWA metadata (mobile-web-app-capable, etc.)

### 5. **Page-Specific Metadata**

#### a. Home Page (`/src/app/page.tsx`)

- Custom title: "Beranda - Daftar Kelas Terbuka"
- Deskripsi yang menjelaskan konten halaman
- Open Graph tags untuk social sharing

#### b. Class Detail Page (`/src/app/class/[id]/page.tsx`)

- **Dynamic metadata** menggunakan `generateMetadata()`
- Title berdasarkan nama kelas dan tanggal
- Description dari database
- Keywords dinamis
- Open Graph dan Twitter Card per kelas
- URL canonical per kelas

#### c. Login Page (`/src/app/auth/login/layout.tsx`)

- Metadata khusus untuk halaman login
- `robots: index: false` untuk tidak mengindeks auth pages

### 6. **JSON-LD Structured Data**

#### a. Organization & Website Schema (`/src/app/layout.tsx`)

```json
{
  "@type": "Organization",
  "name": "BIOS - Bina Informatika Optimis Sukses",
  "url": "https://kelasbios.vercel.app",
  "address": {
    "streetAddress": "Jl. Lodan Raya No.2",
    "addressLocality": "Ancol, Jakarta Utara"
  }
}
```

```json
{
  "@type": "WebSite",
  "name": "BIOS LMS",
  "potentialAction": {
    "@type": "SearchAction"
  }
}
```

#### b. Course Schema (`/src/app/class/[id]/page.tsx`)

```json
{
  "@type": "Course",
  "name": "Nama Kelas",
  "provider": "BIOS - Universitas Bunda Mulia",
  "instructor": "Nama Dosen",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "offers": {
      "price": "...",
      "availability": "InStock/SoldOut"
    }
  }
}
```

### 7. **Additional Files**

- `browserconfig.xml` - Konfigurasi untuk Windows tiles

## 🔍 Cara Mengecek SEO

### 1. **Robots.txt**

Kunjungi: https://kelasbios.vercel.app/robots.txt

### 2. **Sitemap**

Kunjungi: https://kelasbios.vercel.app/sitemap.xml

### 3. **Manifest**

Kunjungi: https://kelasbios.vercel.app/manifest.json

### 4. **Structured Data**

- Gunakan [Rich Results Test](https://search.google.com/test/rich-results)
- Masukkan URL: https://kelasbios.vercel.app
- Test juga URL kelas: https://kelasbios.vercel.app/class/[slug]

### 5. **Meta Tags**

- Klik kanan > View Page Source
- Cari tag meta di <head>
- Atau gunakan extension: [Meta SEO Inspector](https://chrome.google.com/webstore/detail/meta-seo-inspector)

## 📊 Google Search Console

### Setup (Sudah dilakukan)

1. ✅ Google verification code sudah ada di metadata
2. ✅ Sitemap URL: `https://kelasbios.vercel.app/sitemap.xml`

### Langkah Selanjutnya

1. **Submit Sitemap** di Google Search Console:
   - Buka [Google Search Console](https://search.google.com/search-console)
   - Pilih property: kelasbios.vercel.app
   - Klik "Sitemaps" di sidebar kiri
   - Submit URL: `https://kelasbios.vercel.app/sitemap.xml`

2. **Request Indexing** untuk halaman penting:
   - Buka "URL Inspection" di GSC
   - Masukkan URL halaman (contoh: https://kelasbios.vercel.app)
   - Klik "Request Indexing"
   - Ulangi untuk halaman penting lainnya

3. **Monitor Performance**:
   - Lihat tab "Performance" untuk melihat impressions dan clicks
   - Biasanya butuh 1-2 minggu untuk mulai muncul di Google

## 🎯 Best Practices SEO

### Konten

- ✅ Judul kelas yang deskriptif dan unique
- ✅ Deskripsi kelas minimal 150 karakter
- ✅ Gunakan keyword yang relevan (nama mata kuliah, topik)

### Technical

- ✅ Fast loading time (Next.js App Router sudah optimal)
- ✅ Mobile responsive (Tailwind CSS)
- ✅ HTTPS enabled (Vercel default)
- ✅ Canonical URLs
- ✅ Structured data

### Content Strategy

1. **Update Regularly**: Google suka konten fresh
   - Buat kelas baru secara berkala
   - Update deskripsi kelas
2. **Internal Linking**:
   - Link antar kelas yang relevan
   - Breadcrumbs navigation
3. **Unique Content**:
   - Setiap kelas harus punya deskripsi unik
   - Hindari duplicate content

## 🚀 Apa Selanjutnya?

### Immediate Actions

1. ☐ Deploy ke production (Vercel)
2. ☐ Submit sitemap ke Google Search Console
3. ☐ Request indexing untuk 5-10 halaman penting
4. ☐ Test structured data dengan Rich Results Test
5. ☐ Verifikasi robots.txt dan sitemap accessible

### Short Term (1-2 minggu)

1. ☐ Monitor Google Search Console untuk errors
2. ☐ Check mobile usability report
3. ☐ Optimize page load speed (Core Web Vitals)
4. ☐ Add ALT text untuk semua gambar

### Long Term (1-3 bulan)

1. ☐ Buat konten blog/artikel untuk SEO
2. ☐ Build backlinks dari website UBM atau partner
3. ☐ Optimize untuk long-tail keywords
4. ☐ A/B test meta descriptions
5. ☐ Implement breadcrumbs schema

## 📈 Metrics to Track

### Google Search Console

- **Impressions**: Berapa kali muncul di hasil pencarian
- **Clicks**: Berapa kali orang klik link Anda
- **CTR**: Click-through rate (clicks/impressions)
- **Position**: Ranking rata-rata di hasil pencarian

### Google Analytics (jika sudah setup)

- **Organic Traffic**: Visitor dari Google Search
- **Bounce Rate**: Berapa % langsung keluar
- **Session Duration**: Berapa lama user di website
- **Conversion Rate**: Berapa % yang mendaftar kelas

## 🔗 Useful Tools

### SEO Testing

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema Markup Validator](https://validator.schema.org/)

### SEO Extensions

- Meta SEO Inspector (Chrome)
- SEO Minion (Chrome)
- Lighthouse (Chrome DevTools)

### SEO Research

- [Google Trends](https://trends.google.com/) - Cari keyword trending
- [AnswerThePublic](https://answerthethepublic.com/) - Temukan pertanyaan yang dicari orang
- [Ubersuggest](https://neilpatel.com/ubersuggest/) - Keyword research

## 📝 Notes

### Vercel Deployment

Pastikan environment variable di Vercel match dengan local:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Sitemap Important

Sitemap akan di-generate otomatis saat build/deploy. Jika ada perubahan pada kelas (baru/update), sitemap akan update otomatis.

### Canonical URLs

Karena kita support akses kelas via UUID dan slug, pastikan canonical URL selalu menggunakan slug untuk menghindari duplicate content.

## ❓ Troubleshooting

### Sitemap tidak muncul

- Cek apakah Supabase connection berhasil
- Verify query ke database berhasil
- Check di browser: `https://kelasbios.vercel.app/sitemap.xml`

### Google tidak mengindeks

- Butuh waktu 1-2 minggu untuk indexing pertama kali
- Pastikan tidak ada error di robots.txt
- Verify Google Search Console ownership
- Submit sitemap di GSC

### Structured Data error

- Test dengan Google Rich Results Test
- Pastikan semua required fields terisi
- Check syntax JSON-LD

---

**Last Updated:** 26 Februari 2026  
**Maintainer:** BIOS Development Team  
**Version:** 1.0.0
