"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PolicyModal() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPolicyAcceptance();
  }, []);

  const checkPolicyAcceptance = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has accepted policies
      const { data, error } = await supabase
        .from("policy_acceptance")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking policy acceptance:", error);
      }

      // Show modal if user hasn't accepted both policies
      if (
        !data ||
        !data.privacy_policy_accepted ||
        !data.terms_of_service_accepted
      ) {
        setShowModal(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in checkPolicyAcceptance:", error);
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
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
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error in handleAccept:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    // Just close modal, will show again on next visit
    setShowModal(false);
  };

  if (loading || !showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-950 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">
            Kebijakan Privasi & Syarat Layanan
          </h2>
          <p className="text-gray-300 text-sm">
            Harap baca dan terima kebijakan kami untuk melanjutkan
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📄 Privacy Policy
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Kami mengumpulkan dan melindungi data pribadi Anda sesuai dengan
                peraturan yang berlaku. Data yang dikumpulkan meliputi nama,
                email, NIM, dan informasi pembayaran.
              </p>
              <Link
                href="/privacy-policy"
                target="_blank"
                className="text-sm text-primary-700 hover:text-primary-900 underline font-medium"
              >
                Baca selengkapnya →
              </Link>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📜 Terms of Service
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Dengan menggunakan BIOS LMS, Anda setuju untuk mematuhi semua
                aturan dan ketentuan yang berlaku, termasuk pembayaran, akses
                kelas, dan penggunaan materi.
              </p>
              <Link
                href="/terms-of-service"
                target="_blank"
                className="text-sm text-primary-700 hover:text-primary-900 underline font-medium"
              >
                Baca selengkapnya →
              </Link>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Penting:</strong> Jika Anda menolak, modal ini akan
                muncul kembali saat Anda mengunjungi website.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleDecline}
              disabled={accepting}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              Tolak
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="px-6 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? "Menyimpan..." : "Saya Setuju & Terima"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
