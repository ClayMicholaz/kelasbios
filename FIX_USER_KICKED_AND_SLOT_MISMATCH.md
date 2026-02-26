# Fix: User Terpental & Perbedaan Info Slot

**Tanggal:** 26 Februari 2026  
**Status:** ✅ Selesai

## 📝 Laporan Masalah

### 1. User Terpental Saat Input Nomor HP

Beberapa akun Google member terpental (logout otomatis) saat mengisi nomor WhatsApp pada form pendaftaran kelas.

### 2. Perbedaan Info Slot Antara Admin dan User

Admin dan user melihat jumlah slot tersedia yang berbeda untuk kelas yang sama.

---

## 🔍 Analisis Masalah

### Masalah 1: User Terpental

**Lokasi:** [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts)

**Penyebab:**

- Middleware melakukan validasi domain email `@student.ubm.ac.id` di **setiap request**
- Saat user sedang mengisi form nomor HP, middleware mendeteksi email non-UBM
- User langsung di-logout paksa dan redirect ke halaman error
- Ini mengganggu user experience, terutama saat sedang mengisi form

**Kode Sebelumnya:**

```typescript
// Berjalan di SETIAP request
if (user && !user.email?.endsWith("@student.ubm.ac.id")) {
  await supabase.auth.signOut();
  const url = request.nextUrl.clone();
  url.pathname = "/auth/error";
  url.searchParams.set("error", "invalid_domain");
  return NextResponse.redirect(url);
}
```

### Masalah 2: Perbedaan Info Slot

**Lokasi:** [src/app/admin/classes/page.tsx](src/app/admin/classes/page.tsx)

**Penyebab:**

- **Admin**: Menggunakan nested join yang mengambil SEMUA enrollments, lalu filter di JavaScript
- **User**: Menggunakan direct filtered query `.eq("payment_status", "verified")`
- Perbedaan metode query bisa menyebabkan hasil yang tidak konsisten

**Kode Admin Sebelumnya:**

```typescript
const { data: classes } = await supabase.from("classes").select(`
    *,
    enrollments(payment_status)  // <-- Ambil SEMUA enrollments
  `);

// Filter di JavaScript
const enrollmentCount =
  classItem.enrollments?.filter((e: any) => e.payment_status === "verified")
    .length || 0;
```

**Kode User:**

```typescript
const { data: enrollments } = await supabase
  .from("enrollments")
  .select("id, payment_status")
  .eq("class_id", classData.id)
  .eq("payment_status", "verified"); // <-- Filter langsung di query

const enrollmentCount = enrollments?.length || 0;
```

---

## ✅ Solusi yang Diterapkan

### Fix 1: Validasi Domain Hanya di Auth Callback

**File:** [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts)

**Perubahan:**

- Validasi domain dipindahkan dari **semua request** ke **hanya di auth callback**
- User tidak akan terpental saat sedang mengisi form
- Validasi tetap berjalan saat initial login untuk mencegah akun non-UBM

```typescript
// Hanya validasi saat auth callback, bukan setiap request
if (
  user &&
  !user.email?.endsWith("@student.ubm.ac.id") &&
  request.nextUrl.pathname.startsWith("/auth/callback")
) {
  await supabase.auth.signOut();
  const url = request.nextUrl.clone();
  url.pathname = "/auth/error";
  url.searchParams.set("error", "invalid_domain");
  return NextResponse.redirect(url);
}
```

**Manfaat:**

- ✅ User tidak terpental saat mengisi form
- ✅ Validasi domain tetap aktif saat login
- ✅ User experience lebih smooth

### Fix 2: Standardisasi Query Enrollment Count

**File:** [src/app/admin/classes/page.tsx](src/app/admin/classes/page.tsx)

**Perubahan:**

- Admin sekarang menggunakan **direct filtered query** sama seperti user
- Menghilangkan nested join yang bisa menyebabkan inkonsistensi
- Menggunakan loop untuk query terpisah per kelas

```typescript
// Get all classes tanpa nested join
const { data: classes } = await supabase
  .from("classes")
  .select("*")
  .order("class_date", { ascending: false });

// Query terpisah untuk setiap kelas (konsisten dengan user)
const classesWithCount = [];
if (classes) {
  for (const classItem of classes) {
    const { data: verifiedEnrollments } = await supabase
      .from("enrollments")
      .select("id")
      .eq("class_id", classItem.id)
      .eq("payment_status", "verified"); // <-- Filter sama dengan user

    classesWithCount.push({
      ...classItem,
      enrollment_count: verifiedEnrollments?.length || 0,
    });
  }
}
```

**Manfaat:**

- ✅ Admin dan user melihat jumlah slot yang sama
- ✅ Data enrollment count konsisten di seluruh aplikasi
- ✅ Menghindari bug counting dari nested join

### Fix 3: Session Validation di EnrollButton

**File:** [src/app/class/[id]/EnrollButton.tsx](src/app/class/[id]/EnrollButton.tsx)

**Perubahan:**

- Tambahan validasi session sebelum enrollment
- Error handling yang lebih informatif jika session expired

```typescript
// Verify user session before enrollment
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
  throw new Error(
    "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.",
  );
}
```

**Manfaat:**

- ✅ User mendapat error message yang jelas jika session expired
- ✅ Mencegah error cryptic saat enrollment
- ✅ Better user experience

---

## 🧪 Testing

### Test Scenario 1: Member Non-UBM

1. ✅ Login dengan Google account non-UBM di auth callback → Ditolak dengan error
2. ✅ Jika somehow sudah login, tidak akan terpental saat mengisi form

### Test Scenario 2: Member UBM

1. ✅ Login dengan @student.ubm.ac.id → Berhasil
2. ✅ Buka halaman kelas → Melihat slot tersedia
3. ✅ Klik "Daftar Kelas" → Form muncul
4. ✅ Input nomor WhatsApp → Tidak terpental
5. ✅ Submit form → Berhasil mendaftar

### Test Scenario 3: Konsistensi Slot

1. ✅ Admin melihat kelas X dengan 5/20 peserta
2. ✅ User juga melihat kelas X dengan 5/20 peserta
3. ✅ Setelah ada peserta baru terverifikasi → Keduanya update ke 6/20

---

## 📊 Impact

### User Experience

- **Sebelum:** User sering terpental saat mengisi form, frustrating
- **Setelah:** User dapat mengisi form dengan lancar tanpa gangguan

### Data Accuracy

- **Sebelum:** Admin dan user melihat jumlah slot berbeda
- **Setelah:** Semua pihak melihat data yang sama dan akurat

### System Reliability

- **Sebelum:** Middleware terlalu agresif melakukan validasi
- **Setelah:** Validasi hanya dilakukan saat diperlukan

---

## 🔗 Related Files

- [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts) - Middleware auth
- [src/app/admin/classes/page.tsx](src/app/admin/classes/page.tsx) - Admin classes list
- [src/app/class/[id]/EnrollButton.tsx](src/app/class/[id]/EnrollButton.tsx) - Enrollment form
- [src/app/class/[id]/page.tsx](src/app/class/[id]/page.tsx) - Class detail page
- [src/components/ClassCard.tsx](src/components/ClassCard.tsx) - Class card component

---

## 📌 Notes

- Validasi domain tetap aktif untuk security, hanya dipindahkan timing-nya
- Query enrollment count sekarang konsisten di seluruh aplikasi
- Session validation ditambahkan untuk better error handling
