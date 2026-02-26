"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase-config";
import { isAdminEmail } from "@/lib/adminUtils";
import { extractNIMFromEmail } from "@/lib/nimUtils";
import { handleAuthError } from "@/lib/authUtils";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userNim, setUserNim] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured properly");
      setLoading(false);
      return;
    }

    const updateUserInfo = (user: User | null) => {
      if (user?.email) {
        const nim = extractNIMFromEmail(user.email);
        const admin = isAdminEmail(user.email);
        setUserNim(nim);
        setIsAdmin(admin);
      } else {
        setUserNim(null);
        setIsAdmin(false);
      }
    };

    // Get initial session
    const initAuth = async () => {
      try {
        // console.log("Initializing auth...");

        // Get current session first without refreshing
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          // Handle specific auth errors
          await handleAuthError(error);
        }

        // console.log("Current session:", session);
        setUser(session?.user ?? null);
        updateUserInfo(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        // console.error("Failed to get session:", err);
        // Clear any corrupted session data
        try {
          await supabase.auth.signOut();
        } catch (signOutErr) {
          // console.error("Error during signOut:", signOutErr);
        }
        setUser(null);
        updateUserInfo(null);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log("Auth state changed:", event, session);

      // Handle different auth events
      if (event === "TOKEN_REFRESHED") {
        // console.log("Token refreshed successfully");
      } else if (event === "SIGNED_OUT") {
        // console.log("User signed out");
        // Clear local storage to prevent refresh token issues
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (url) {
            const domain = url.split("//")[1]?.replace(/\./g, "") || "";
            localStorage.removeItem(`sb-${domain}-auth-token`);
          }
        } catch (err) {
          // console.error("Error clearing localStorage:", err);
        }
      } else if (event === "SIGNED_IN") {
        // console.log("User signed in successfully");
      }

      setUser(session?.user ?? null);
      updateUserInfo(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // console.log("Starting Google sign in...");

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // console.error("Supabase not configured properly");
        throw new Error("Supabase configuration error");
      }

      // console.log("Supabase configured, initiating OAuth...");
      // console.log("Redirect URL:", `${window.location.origin}/auth/callback`);

      // Test Supabase connection first
      // console.log("Testing Supabase connection...");
      const { data: testData, error: testError } =
        await supabase.auth.getSession();
      // console.log("Supabase connection test:", { testData, testError });

      // Test available providers
      // console.log("Testing available providers...");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env
                .NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
          }
        );
        const settings = await response.json();
        // console.log("Available providers:", settings);

        if (settings?.external?.google?.enabled) {
          // console.log("✅ Google provider is enabled");
        } else {
          // console.warn("❌ Google provider is NOT enabled or configured");
        }
      } catch (providerError) {
        // console.log("Could not fetch provider settings:", providerError);
      }

      // console.log("Attempting OAuth with provider: google");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            hd: "student.ubm.ac.id",
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // console.log("OAuth response:", { data, error });

      // if (error) {
      //   console.error("OAuth error details:", {
      //     message: error.message,
      //     status: error.status,
      //   });
      //   throw error;
      // }

      // console.log("OAuth initiated successfully:", data);
      // console.log("Waiting for redirect...");

      // Add a timeout to detect if redirect didn't happen
      setTimeout(() => {
        console.warn(
          "Redirect didn't happen within 3 seconds - possible OAuth issue"
        );
      }, 3000);
    } catch (err) {
      console.error("Sign in error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage first to prevent any refresh token issues
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (url) {
        const domain = url.split("//")[1]?.replace(".", "") || "";
        localStorage.removeItem(`sb-${domain}-auth-token`);
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("SignOut error:", error);
        // Even if there's an error, clear local state
      }

      // Clear state
      setUser(null);
      setIsAdmin(false);
      setUserNim(null);
    } catch (err) {
     // console.error("Unexpected signOut error:", err);
      // Clear state anyway
      setUser(null);
      setIsAdmin(false);
      setUserNim(null);
    }
  };

  return {
    user,
    loading,
    isAdmin,
    userNim,
    signInWithGoogle,
    signOut,
  };
}
