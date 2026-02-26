import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/adminUtils";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();

    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Callback] Error exchanging code:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?message=${encodeURIComponent(
          error.message || "Gagal membuat sesi",
        )}`,
      );
    }

    // Successfully authenticated
    console.log("[Callback] Successfully exchanged code for session");

    // Create profile immediately after session created
    const user = sessionData?.session?.user;
    if (user) {
      console.log("[Callback] Creating/checking profile for:", user.email);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        console.log("[Callback] Profile not found, creating new profile");

        // Extract NIM from email (8 digits)
        const emailPrefix = user.email?.split("@")[0] || "";
        const nimMatch = emailPrefix.match(/\d{8}/);
        const nim = nimMatch ? nimMatch[0] : "";

        // Get full_name from user metadata (Google OAuth provides this)
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        // Check if user is admin based on NEXT_PUBLIC_ADMIN_EMAILS
        const userRole = isAdminEmail(user.email || "") ? "admin" : "member";
        console.log(
          `[Callback] Setting role for ${user.email}:`,
          userRole,
          "(admin list checked)",
        );

        // Create profile
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            nim: nim,
            role: userRole, // Check admin list
          })
          .select()
          .single();

        if (insertError) {
          console.error("[Callback] Failed to create profile:", insertError);
          // Continue anyway - dashboard will retry
        } else {
          console.log("[Callback] Profile created successfully:", newProfile);
        }
      } else {
        console.log("[Callback] Profile already exists");
      }
    }

    // Redirect to dashboard or specified redirect URL
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${redirectTo ?? "/dashboard"}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(
        `https://${forwardedHost}${redirectTo ?? "/dashboard"}`,
      );
    } else {
      return NextResponse.redirect(`${origin}${redirectTo ?? "/dashboard"}`);
    }
  }

  // No code provided - redirect to auth error
  console.error("[Callback] No code provided");
  return NextResponse.redirect(
    `${origin}/auth/error?message=${encodeURIComponent(
      "Kode autentikasi tidak ditemukan",
    )}`,
  );
}
