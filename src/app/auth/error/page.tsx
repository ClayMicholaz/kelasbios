"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let message = "Terjadi kesalahan saat autentikasi";
  let description = "Silakan coba lagi atau hubungi administrator";

  if (error === "invalid_domain") {
    message = "Email Domain Tidak Valid";
    description =
      "Anda harus menggunakan email dengan domain @student.ubm.ac.id untuk mengakses sistem ini.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4 py-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center">
        <div className="text-primary-600 text-5xl mb-4">⚠</div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">{description}</p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
