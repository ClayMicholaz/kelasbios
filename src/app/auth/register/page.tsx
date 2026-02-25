"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-8 w-8 text-primary-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Tidak Perlu Daftar!
            </h2>
            <p className="text-gray-600">
              BIOS LMS sekarang hanya menggunakan{" "}
              <strong className="text-primary-800">Google OAuth</strong> untuk
              login.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Cara Masuk ke BIOS LMS:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Klik tombol "Masuk dengan Google UBM"</li>
              <li>Login dengan akun Google @student.ubm.ac.id Anda</li>
              <li>
                Profil Anda akan dibuat otomatis dengan data dari akun Google
              </li>
              <li>Langsung dapat mengakses dashboard dan mendaftar kelas!</li>
            </ol>
          </div>

          <div className="space-y-3 mt-6">
            <Link
              href="/auth/login"
              className="block w-full px-6 py-3 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-center"
            >
              Masuk dengan Google UBM
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Mengalihkan ke halaman login dalam 3 detik...
          </p>
        </div>
      </div>
    </div>
  );
}
