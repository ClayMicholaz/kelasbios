import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - BIOS LMS",
  description: "Privacy Policy for BIOS Learning Management System",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Informasi yang Kami Kumpulkan
              </h2>
              <p className="text-gray-700 leading-relaxed">
                BIOS LMS mengumpulkan informasi berikut dari pengguna:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Informasi Akun:</strong> Nama lengkap, email
                  (@student.ubm.ac.id), dan NIM mahasiswa
                </li>
                <li>
                  <strong>Informasi Kelas:</strong> Data pendaftaran kelas,
                  status pembayaran, dan kehadiran
                </li>
                <li>
                  <strong>Informasi Pembayaran:</strong> Bukti transfer
                  pembayaran yang diunggah oleh mahasiswa
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Penggunaan Informasi
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Informasi yang dikumpulkan digunakan untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Mengelola pendaftaran dan akses ke kelas</li>
                <li>Memverifikasi pembayaran kelas</li>
                <li>Mengirim notifikasi terkait kelas dan sistem</li>
                <li>Meningkatkan pengalaman pengguna platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Keamanan Data
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kami menggunakan protokol keamanan standar industri untuk
                melindungi data Anda. Data disimpan di server Supabase yang
                terenkripsi dan hanya dapat diakses oleh administrator yang
                berwenang.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Pembagian Informasi
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kami tidak membagikan informasi pribadi Anda kepada pihak ketiga
                tanpa persetujuan Anda, kecuali jika diwajibkan oleh hukum atau
                untuk keperluan operasional internal Universitas Bunda Mulia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Hak Pengguna
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Mengakses data pribadi Anda</li>
                <li>Meminta koreksi data yang tidak akurat</li>
                <li>
                  Menghapus akun Anda (dengan konsekuensi kehilangan akses)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Autentikasi Google OAuth
              </h2>
              <p className="text-gray-700 leading-relaxed">
                BIOS LMS menggunakan Google OAuth 2.0 untuk autentikasi. Dengan
                masuk menggunakan akun Google UBM Anda, Anda memberikan izin
                kepada kami untuk mengakses nama dan alamat email Anda yang
                terdaftar di Google. Kami tidak menyimpan password Google Anda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Perubahan Kebijakan
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke
                waktu. Perubahan akan diposting di halaman ini dengan tanggal
                pembaruan yang baru.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Kontak
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini,
                silakan hubungi administrator BIOS LMS melalui email institusi
                Universitas Bunda Mulia.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} BIOS LMS - Universitas Bunda Mulia.
              Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
