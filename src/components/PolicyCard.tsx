"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PolicyCard() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    checkPolicyAcceptance();
  }, []);

  const checkPolicyAcceptance = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has accepted policies
      const { data } = await supabase
        .from("policy_acceptance")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // If user has accepted, hide the card permanently
      if (
        data &&
        data.privacy_policy_accepted &&
        data.terms_of_service_accepted
      ) {
        setIsDismissed(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking policy acceptance:", error);
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Upsert policy acceptance
      const { error } = await supabase.from("policy_acceptance").upsert(
        {
          user_id: user.id,
          privacy_policy_accepted: true,
          terms_of_service_accepted: true,
          accepted_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

      if (error) {
        console.error("Error accepting policies:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
      } else {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error("Error in handleAccept:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setAccepting(false);
    }
  };

  const handleIgnore = () => {
    // Just minimize, will show again on next page load
    setIsMinimized(true);
  };

  if (loading || isDismissed) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition-all text-sm font-medium"
          aria-label="Tampilkan informasi kebijakan"
        >
          📋 Kebijakan
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Informasi Kebijakan
          </h3>
          <button
            onClick={handleIgnore}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Minimalkan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Mohon baca dan terima kebijakan kami untuk melanjutkan
        </p>
        <div className="space-y-2 mb-4">
          <Link
            href="/privacy-policy"
            target="_blank"
            className="block text-xs text-primary-700 hover:text-primary-900 hover:underline font-medium"
          >
            📄 Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            target="_blank"
            className="block text-xs text-primary-700 hover:text-primary-900 hover:underline font-medium"
          >
            📜 Terms of Service
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all text-xs font-semibold disabled:opacity-50"
          >
            {accepting ? "Menyimpan..." : "✓ Accept"}
          </button>
          <button
            onClick={handleIgnore}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold"
          >
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
}
