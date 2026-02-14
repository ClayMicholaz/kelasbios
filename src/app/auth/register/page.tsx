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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-accent-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent-100 mb-4">
            <svg
              className="h-8 w-8 text-primary-700"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tidak Perlu Daftar!
          </h2>
          <p className="text-gray-600 mb-6">
            BIOS LMS sekarang hanya menggunakan <strong>Google OAuth</strong>{" "}
            untuk login.
          </p>
        </div>

        <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 text-left">
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

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors font-semibold shadow-lg"
          >
            Masuk dengan Google UBM
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Mengalihkan ke halaman login dalam 3 detik...
        </p>
      </div>
    </div>
  );
}
