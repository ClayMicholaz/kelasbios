import { createClient } from "@/lib/supabase/server";
import ClassCard from "@/components/ClassCard";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  // Get all open classes with enrollment count
  const { data: classes, error } = await supabase
    .from("classes")
    .select(
      `
      *,
      enrollments!inner(payment_status)
    `,
    )
    .eq("status", "open")
    .order("class_date", { ascending: true });

  // Calculate enrollment count for each class
  const classesWithCount =
    classes?.map((classItem) => {
      const enrollmentCount =
        classItem.enrollments?.filter(
          (e: any) => e.payment_status === "verified",
        ).length || 0;

      return {
        ...classItem,
        enrollment_count: enrollmentCount,
      };
    }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Selamat Datang di BIOS LMS
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-accent-bright">
              Platform Pembelajaran Eksklusif untuk Mahasiswa Teknik Informatika
              UBM
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-300">
              Tingkatkan keterampilan Anda dengan bergabung di kelas-kelas
              eksklusif BIOS. Hanya Rp 10.000 per sesi untuk pembelajaran
              intensif selama 2 jam!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/login"
                className="px-8 py-3 bg-accent-bright text-primary-950 rounded-lg hover:bg-accent-400 transition-colors font-semibold text-lg"
              >
                Masuk dengan Google UBM
              </Link>
              <Link
                href="#classes"
                className="px-8 py-3 bg-transparent text-white rounded-lg hover:bg-white/10 transition-colors font-medium text-lg border-2 border-white"
              >
                Lihat Kelas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Mengapa Memilih BIOS LMS?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Platform pembelajaran terbaik untuk mahasiswa Teknik Informatika UBM
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Materi Berkualitas
              </h3>
              <p className="text-gray-600 text-sm">
                Kurikulum yang dirancang khusus dengan materi terkini dan
                relevan
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Harga Terjangkau
              </h3>
              <p className="text-gray-600 text-sm">
                Hanya Rp 10.000 untuk sesi pembelajaran 2 jam yang intensif
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Kelas Eksklusif
              </h3>
              <p className="text-gray-600 text-sm">
                Jumlah peserta terbatas untuk pengalaman belajar yang optimal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section id="classes" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kelas yang Tersedia
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih kelas yang sesuai dengan minat dan kebutuhan Anda. Daftar
              sekarang sebelum tempat habis!
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              Terjadi kesalahan saat memuat data kelas
            </div>
          )}

          {classesWithCount.length === 0 ? (
            <EmptyState
              title="Belum Ada Kelas Tersedia"
              description="Saat ini belum ada kelas yang dibuka. Silakan cek kembali nanti."
              icon={
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classesWithCount.map((classItem) => (
                <ClassCard key={classItem.id} classData={classItem} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Meningkatkan Keterampilan Anda?
          </h2>
          <p className="text-xl mb-8 text-accent-100">
            Bergabunglah dengan ribuan mahasiswa yang telah mengambil kelas di
            BIOS LMS
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-4 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-semibold text-lg shadow-lg"
          >
            Masuk Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
