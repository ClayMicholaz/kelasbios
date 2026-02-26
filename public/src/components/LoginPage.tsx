"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");

    if (errorParam === "invalid_email") {
      setError(
        "Hanya akun dengan format s{8digit}@student.ubm.ac.id yang dapat mengakses. Contoh: s32230111@student.ubm.ac.id"
      );
    } else if (errorParam === "auth_error") {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    }

    // Debug Supabase configuration
    // console.log("🔍 Environment Debug:", {
    //   supabaseUrl:
    //     process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
    //   hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    //   keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    //   environment: process.env.NODE_ENV,
    //   origin: window.location.origin,
    //   hostname: window.location.hostname,
    // });

    // Additional production debugging
    // if (process.env.NODE_ENV === "production") {
    //   console.log("🚀 Production Mode - Environment Check:");
    //   console.log(
    //     "Supabase URL configured:",
    //     !!process.env.NEXT_PUBLIC_SUPABASE_URL
    //   );
    //   console.log(
    //     "Supabase Key configured:",
    //     !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    //   );
    // }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      // console.log("Login button clicked");

      await signInWithGoogle();

      // If we reach here without redirect, something might be wrong
      // console.log("OAuth function completed, waiting for redirect...");
    } catch (error) {
      // console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 p-4 sm:p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Open Recruitment BIOS
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Masuk dengan akun student UBM untuk mendaftar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Loading..." : "Masuk dengan Google"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Hanya akun dengan domain @student.ubm.ac.id yang dapat mengakses
          </p>
        </div>
      </div>
    </div>
  );
}
