"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { isAdminRole } from "@/lib/adminUtils";

/**
 * useAuthSecure - Enhanced version of useAuth that uses API routes
 * instead of direct Supabase calls from the client.
 * This hides Supabase URLs from the Network tab.
 */
export function useAuthSecure() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch profile via API route (hides Supabase URL)
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        console.error("[useAuthSecure] Profile fetch failed:", response.status);
        return null;
      }

      const data = await response.json();
      return data.profile as Profile;
    } catch (error) {
      console.error("[useAuthSecure] Profile fetch error:", error);
      return null;
    }
  }, []);

  // Update user info (profile and admin status)
  const updateUserInfo = useCallback(
    async (currentUser: User | null) => {
      if (currentUser) {
        console.log(
          "[useAuthSecure] Fetching profile for user:",
          currentUser.email,
        );

        // Fetch profile via API route with retry logic
        let profileData = await fetchProfile();

        // If profile doesn't exist, retry up to 3 times
        if (!profileData) {
          console.log("[useAuthSecure] Profile not found, will retry...");
          for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            profileData = await fetchProfile();
            if (profileData) {
              console.log(`[useAuthSecure] Profile found on retry ${i + 1}`);
              break;
            }
          }
        }

        if (profileData) {
          console.log(
            "[useAuthSecure] Profile loaded:",
            profileData.full_name,
            "Role:",
            profileData.role,
          );
          setProfile(profileData);
          setIsAdmin(isAdminRole(profileData.role));
        } else {
          console.log("[useAuthSecure] Profile still not found after retries");
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

    // Get initial session (auth.getSession is minimal and doesn't expose much)
    const initAuth = async () => {
      try {
        console.log("[useAuthSecure] Initializing auth...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[useAuthSecure] Session error:", error);
        }

        if (!isMounted) return;

        const currentUser = session?.user ?? null;
        console.log(
          "[useAuthSecure] Initial user:",
          currentUser?.email || "none",
        );
        setUser(currentUser);
        await updateUserInfo(currentUser);
        setLoading(false);
      } catch (error) {
        console.error("[useAuthSecure] Init error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[useAuthSecure] Auth state changed:", _event);
      if (!isMounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await updateUserInfo(currentUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateUserInfo]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile();
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
    refreshProfile,
  };
}
