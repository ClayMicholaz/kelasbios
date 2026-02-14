"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AttendanceCheckProps {
  enrollmentId: string;
  attended: boolean;
}

export default function AttendanceCheck({
  enrollmentId,
  attended,
}: AttendanceCheckProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleAttendance = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("enrollments")
        .update({
          attended: !attended,
          attended_at: !attended ? new Date().toISOString() : null,
        })
        .eq("id", enrollmentId);

      if (error) throw error;

      router.refresh();
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleAttendance}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        attended
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {loading ? "..." : attended ? "Batalkan" : "Tandai Hadir"}
    </button>
  );
}
