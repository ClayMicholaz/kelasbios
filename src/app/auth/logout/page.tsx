"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      console.log("[LogoutPage] Starting logout process...");
      try {
        const supabase = createClient();

        console.log("[LogoutPage] Clearing localStorage...");
        // Clear localStorage
        localStorage.removeItem("policy_accepted");
        localStorage.removeItem("policy_checked_at");

        console.log("[LogoutPage] Signing out from Supabase...");
        // Sign out
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error("[LogoutPage] SignOut error:", error);
          throw error;
        }

        console.log("[LogoutPage] Logout successful, redirecting to home...");
        // Force full reload to ensure clean state
        window.location.href = "/";
      } catch (error) {
        console.error("[LogoutPage] Logout error:", error);
        alert("Terjadi kesalahan saat logout. Halaman akan di-refresh.");
        window.location.href = "/";
      }
    };

    handleLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
