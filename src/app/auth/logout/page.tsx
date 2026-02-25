"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const supabase = createClient();

        // Clear localStorage
        localStorage.removeItem("policy_accepted");
        localStorage.removeItem("policy_checked_at");

        // Sign out
        await supabase.auth.signOut();

        // Redirect
        router.push("/");
        router.refresh();

        // Force full reload to ensure clean state
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } catch (error) {
        console.error("Logout error:", error);
        window.location.href = "/";
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
