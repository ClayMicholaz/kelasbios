"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface EnrollButtonProps {
  classId: string;
  userId: string;
}

export default function EnrollButton({ classId, userId }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create enrollment
      const { error: enrollError } = await supabase.from("enrollments").insert({
        user_id: userId,
        class_id: classId,
        payment_status: "pending",
      });

      if (enrollError) {
        if (enrollError.code === "23505") {
          throw new Error("Anda sudah terdaftar di kelas ini");
        }
        throw enrollError;
      }

      router.push("/dashboard?enrolled=true");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Daftar Kelas Ini"}
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Anda akan diarahkan ke halaman pembayaran
      </p>
    </div>
  );
}
