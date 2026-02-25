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
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        if (!code) {
          console.error("No code found in URL");
          setError("Kode autentikasi tidak ditemukan");
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        console.log("Exchanging code for session...");
        const { data: sessionData, error: sessionError } =
          await supabase.auth.exchangeCodeForSession(code);

        console.log("Exchange result - data:", sessionData ? "exists" : "null");
        console.log("Exchange result - error:", sessionError);

        if (sessionError) {
          console.error("Session exchange error:", sessionError);
          setError(`Gagal membuat sesi: ${sessionError.message}`);
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        console.log("Session created successfully!");
        console.log("Session user:", sessionData?.session?.user?.email);

        // Get user from session (faster than getUser, no hanging)
        const user = sessionData?.session?.user;

        if (!user) {
          console.error("No user in session");
          setError("Gagal mendapatkan data user");
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

        console.log("User data:", {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
          avatar_url: user.user_metadata?.avatar_url,
        });

        console.log("Checking if profile exists in database...");
        // Check if profile exists
        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        console.log("Profile check result:");
        console.log("  - Profile data:", profile);
        console.log(
          "  - Profile error:",
          profileFetchError?.code,
          profileFetchError?.message,
        );

        // If profile doesn't exist, create one with auto-populated data
        // Check for PGRST116 error code which means "not found"
        const profileNotFound =
          !profile ||
          (profileFetchError && profileFetchError.code === "PGRST116");

        if (profileNotFound && user.email) {
          console.log(
            "Profile not found - Creating new profile for:",
            user.email,
          );

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

          console.log("Inserting profile to database...");
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

          console.log("Insert result:");
          console.log("  - Inserted profile:", insertedProfile);
          console.log("  - Insert error:", insertError);

          if (insertError) {
            console.error("Profile insert error:", insertError);
            setError(`Gagal membuat profil: ${insertError.message}`);
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
            return;
          }

          console.log("Profile created successfully:", insertedProfile);
        }

        console.log("Authentication complete! Redirecting to dashboard...");

        // Force a full page redirect to ensure proper state initialization
        // Using window.location instead of router.push for more reliable redirect
        window.location.href = "/dashboard";
      } catch (err: any) {
        console.error("Callback handler error:", err);
        setError(`Terjadi kesalahan: ${err.message}`);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        {error ? (
          <div className="bg-white rounded-lg p-8 border border-red-200 shadow-sm">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Autentikasi Gagal
            </h2>
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <p className="text-sm text-gray-500">
              Mengalihkan kembali ke halaman login...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-10 border border-gray-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-800 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Memproses Autentikasi
            </h2>
            <p className="text-gray-600 text-sm">Mohon tunggu sebentar...</p>
          </div>
        )}
      </div>
    </div>
  );
}
