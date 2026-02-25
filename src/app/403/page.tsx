import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-7xl sm:text-9xl font-bold text-primary-700 mb-4">
            403
          </h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8"></div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 px-4">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <svg
            className="w-24 h-24 sm:w-32 sm:h-32 text-primary-200 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-primary-800 font-semibold mb-2">
              ⚠️ Akses Terbatas
            </p>
            <p className="text-primary-700 text-sm">
              Halaman ini hanya dapat diakses oleh pengguna dengan hak akses
              khusus.
            </p>
          </div>
          <p className="text-gray-700 mb-6">Kemungkinan penyebab:</p>
          <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-primary-600 mr-2 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Anda belum login ke sistem
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mr-2 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Akun Anda tidak memiliki hak akses admin
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mr-2 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Sesi login Anda telah berakhir
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 sm:px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/auth/login"
            className="px-6 sm:px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Login
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-600">
          Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator.
        </p>
      </div>
    </div>
  );
}
