"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        console.log("Starting OAuth callback...");

        // Exchange the code for a session
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get("code");
        const errorCode = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorCode) {
          console.error("OAuth error:", errorCode, errorDescription);
          setError(`Login gagal: ${errorDescription || errorCode}`);
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        if (!code) {
          console.error("No code found in URL");
          setError("Kode autentikasi tidak ditemukan");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        console.log("Exchanging code for session...");
        const { data: sessionData, error: sessionError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          console.error("Session exchange error:", sessionError);
          setError(`Gagal membuat sesi: ${sessionError.message}`);
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        console.log("Session created:", sessionData);

        // Get user data after OAuth
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Get user error:", userError);
          setError("Gagal mendapatkan data user");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        console.log("User data:", {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
        });

        // Check if profile exists
        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        console.log("Profile check:", profile, profileFetchError);

        // If profile doesn't exist, create one with auto-populated data
        if (!profile && user.email) {
          console.log("Creating new profile...");

          // Extract NIM from email (e.g., s32230111@student.ubm.ac.id -> 32230111)
          const emailPrefix = user.email.split("@")[0];
          const nimMatch = emailPrefix.match(/\d{8}/);
          const nim = nimMatch ? nimMatch[0] : "";

          // Get full name from user metadata (Google provides this)
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] || // Fallback to email prefix
            "User";

          // Check if user is admin
          const adminEmails =
            process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((email) =>
              email.trim(),
            ) || [];
          const isAdmin = adminEmails.includes(user.email);

          console.log("Profile data to insert:", {
            id: user.id,
            email: user.email,
            full_name: fullName,
            nim: nim,
            role: isAdmin ? "admin" : "member",
          });

          const { data: insertedProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              full_name: fullName,
              nim: nim,
              role: isAdmin ? "admin" : "member",
            })
            .select()
            .single();

          if (insertError) {
            console.error("Profile insert error:", insertError);
            setError(`Gagal membuat profil: ${insertError.message}`);
            setTimeout(() => router.push("/auth/login"), 3000);
            return;
          }

          console.log("Profile created successfully:", insertedProfile);
        }

        console.log("Redirecting to dashboard...");
        // Force refresh and redirect
        router.refresh();
        window.location.href = "/dashboard";
      } catch (err: any) {
        console.error("Callback handler error:", err);
        setError(`Terjadi kesalahan: ${err.message}`);
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Autentikasi Gagal
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Mengalihkan kembali ke halaman login...
            </p>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500 mb-4"></div>
            <p className="text-gray-600">Memproses autentikasi...</p>
            <p className="text-sm text-gray-500 mt-2">Mohon tunggu...</p>
          </>
        )}
      </div>
    </div>
  );
}
