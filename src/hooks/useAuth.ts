"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { isAdminRole } from "@/lib/adminUtils";
import { extractNIMFromEmail } from "@/lib/nimUtils";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[useAuth] Profile fetch error:", error);
      return null;
    }

    return data as Profile;
  }, []);

  // Update user info (profile and admin status)
  const updateUserInfo = useCallback(
    async (currentUser: User | null) => {
      if (currentUser) {
        console.log("[useAuth] Fetching profile for user:", currentUser.email);

        // Fetch profile from database with retry logic
        let profileData = await fetchProfile(currentUser.id);

        // If profile doesn't exist, retry up to 3 times (might be being created)
        if (!profileData) {
          console.log("[useAuth] Profile not found, will retry...");
          for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
            profileData = await fetchProfile(currentUser.id);
            if (profileData) {
              console.log(`[useAuth] Profile found on retry ${i + 1}`);
              break;
            }
          }
        }

        if (profileData) {
          console.log(
            "[useAuth] Profile loaded:",
            profileData.full_name,
            "Role:",
            profileData.role,
          );
          setProfile(profileData);
          setIsAdmin(isAdminRole(profileData.role));
        } else {
          console.log("[useAuth] Profile still not found after retries");
          // Profile doesn't exist yet, will be created on dashboard
          setProfile(null);
          setIsAdmin(false);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    },
    [fetchProfile],
  );

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Get initial session
    const initAuth = async () => {
      try {
        console.log("[useAuth] Initializing auth...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[useAuth] Session error:", error);
        }

        if (!isMounted) return;

        const currentUser = session?.user ?? null;
        console.log("[useAuth] Initial user:", currentUser?.email || "none");
        setUser(currentUser);

        // Set loading false IMMEDIATELY - don't wait for profile
        setLoading(false);

        // Fetch profile in background (don't block UI)
        if (currentUser) {
          updateUserInfo(currentUser);
        }
      } catch (err) {
        console.error("[useAuth] Failed to get session:", err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state changed:", event);

      if (!isMounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Set loading false IMMEDIATELY for all events
      setLoading(false);

      if (event === "SIGNED_OUT") {
        console.log("[useAuth] User signed out");
        setProfile(null);
        setIsAdmin(false);
      } else if (event === "SIGNED_IN") {
        console.log("[useAuth] User signed in:", currentUser?.email);
        // Fetch profile in background (don't block)
        if (currentUser) {
          updateUserInfo(currentUser);
        }
      } else if (event === "TOKEN_REFRESHED") {
        console.log("[useAuth] Token refreshed");
        // Just refresh profile to ensure it's up to date
        if (currentUser) {
          updateUserInfo(currentUser);
        }
      } else {
        // For other events, fetch profile if user exists
        if (currentUser) {
          updateUserInfo(currentUser);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateUserInfo]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setIsAdmin(isAdminRole(profileData.role));
      }
    }
  }, [user, fetchProfile]);

  return {
    user,
    profile,
    loading,
    isAdmin,
    signOut,
    refreshProfile,
  };
}
