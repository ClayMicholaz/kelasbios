"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <svg
            className="w-32 h-32 text-indigo-200 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-700 mb-6">
            Beberapa hal yang mungkin membantu:
          </p>
          <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Periksa kembali URL yang Anda masukkan
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Kembali ke halaman sebelumnya
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Mulai dari halaman utama
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
