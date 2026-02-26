"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserType } from "@/lib/nimUtils";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // console.log("Processing auth callback...");

        // Check for OAuth error
        const urlParams = new URLSearchParams(window.location.search);
        // const error = urlParams.get("error");

        // if (error) {
        //   console.error("OAuth error:", error);
        //   router.push("/?error=auth_error");
        //   return;
        // }

        // Let Supabase SDK handle the callback automatically
        // It will detect and process PKCE code exchange or hash fragments
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          // console.error("Session error:", sessionError);
          router.push("/?error=auth_error");
          return;
        }

        if (sessionData.session) {
          const email = sessionData.session.user.email;
          // console.log("Session found for email:", email);

          if (email && getUserType(email) !== "unknown") {
            // console.log("Valid UBM email, redirecting to dashboard");
            router.push("/dashboard");
          } else {
            // console.log("Invalid email format:", email);
            await supabase.auth.signOut();
            router.push("/?error=invalid_email");
          }
        } else {
          // console.log("No session found, redirecting to home");
          router.push("/");
        }
      } catch (err) {
        // console.error("Auth callback error:", err);
        router.push("/?error=auth_error");
      }
    };

    // Add delay to ensure URL params are available and SDK processes callback
    const timer = setTimeout(handleAuthCallback, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Memproses login...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
