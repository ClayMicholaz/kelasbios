"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      console.log("[LogoutPage] Starting logout process...");
      try {
        const supabase = createClient();

        console.log("[LogoutPage] Clearing ALL storage...");
        // Clear ALL localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Clear specific cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/",
            );
        });

        console.log("[LogoutPage] Signing out from Supabase...");
        // Sign out from Supabase
        await supabase.auth.signOut({ scope: "global" });

        console.log("[LogoutPage] Logout successful, redirecting to login...");
      } catch (error) {
        console.error("[LogoutPage] Logout error:", error);
      } finally {
        // Force complete page reload (regardless of success/error)
        window.location.replace("/auth/login");
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
