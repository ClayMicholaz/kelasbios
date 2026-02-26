import { supabase } from "./supabase";

export const clearCorruptedTokens = async () => {
  try {
    // Clear Supabase session
    await supabase.auth.signOut();

    // Clear localStorage manually
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url && typeof window !== "undefined") {
      const domain = url.split("//")[1]?.replace(/[.-]/g, "") || "";
      const keys = Object.keys(localStorage);

      // Remove all supabase auth related keys
      keys.forEach((key) => {
        if (key.includes("sb-") && key.includes("auth")) {
          localStorage.removeItem(key);
        }
      });

      // Also try common variations
      const possibleKeys = [
        `sb-${domain}-auth-token`,
        "sb-auth-token",
        "supabase.auth.token",
      ];

      possibleKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
    }

    // console.log("Corrupted tokens cleared");
  } catch (error) {
    console.error("Error clearing corrupted tokens:", error);
  }
};

export const handleAuthError = async (error: unknown) => {
  console.error("Auth error:", error);

  // Check if it's a token-related error
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (
    errorMessage?.includes("refresh") ||
    errorMessage?.includes("token") ||
    errorMessage?.includes("invalid_grant")
  ) {
    await clearCorruptedTokens();
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
};
