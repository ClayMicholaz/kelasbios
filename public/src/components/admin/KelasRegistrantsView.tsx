"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { KelasRegistration } from "@/types/kelas";
import { FormSession } from "@/types/formSession";
import { formatDate } from "@/lib/dateUtils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";

interface KelasRegistrantsViewProps {
  session: FormSession;
  onBackAction: () => void;
}

export default function KelasRegistrantsView({
  session,
  onBackAction,
}: KelasRegistrantsViewProps) {
  const [registrants, setRegistrants] = useState<KelasRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistrant, setSelectedRegistrant] =
    useState<KelasRegistration | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchRegistrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const fetchRegistrants = async () => {
    setLoading(true);
    try {
      // console.log("🔍 [KelasRegistrantsView] Starting fetchRegistrants...");
      // console.log("🔍 Session ID:", session.id);
      // console.log("🔍 Session Title:", session.title);

      // Now do the actual query
      const { data, error } = await supabase
        .from("kelas_registrations")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false });

      // console.log("📊 Full query result:", { data, error });
      // console.log("📊 Query filters: session_id =", session.id);

      // if (error) {
      //   console.error("❌ Supabase error details:", {
      //     message: error.message,
      //     details: error.details,
      //     hint: error.hint,
      //     code: error.code,
      //   });
      //   throw error;
      // }

      setRegistrants(data || []);
      // console.log("✅ Final registrants set:", data?.length || 0);

      // Additional check - query all registrations to see if any exist
      const { data: allData } = await supabase
        .from("kelas_registrations")
        .select("session_id, nama_lengkap")
        .limit(10);

      // console.log("🌍 All registrations in table (sample):", allData);
    } catch (error) {
      // console.error("💥 Error in fetchRegistrants:", error);
      addToast("Gagal memuat data pendaftar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (
    registrantId: string,
    verified: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("kelas_registrations")
        .update({ payment_verified: verified })
        .eq("id", registrantId);

      if (error) throw error;

      addToast(
        `Pembayaran berhasil ${verified ? "diverifikasi" : "ditolak"}`,
        "success"
      );
      fetchRegistrants();
    } catch (error) {
      console.error("Error verifying payment:", error);
      addToast("Gagal memverifikasi pembayaran", "error");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nama Lengkap",
      "NIM",
      "Prodi",
      "Semester",
      "Kelas",
      "Pembayaran Terverifikasi",
      "Tanggal Daftar",
    ];

    const rows = registrants.map((r) => [
      r.nama_lengkap,
      r.nim,
      r.prodi,
      r.semester,
      r.kelas,
      r.payment_verified ? "Ya" : "Belum",
      new Date(r.created_at).toLocaleString("id-ID"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pendaftar_kelas_${formatDate(
      session.tanggal_kelas || ""
    )}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <button
            onClick={onBackAction}
            className="text-blue-700 hover:text-blue-800 font-semibold mb-3 flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
          >
            ← Kembali ke Daftar Session
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📚 Pendaftar Kelas: {formatDate(session.tanggal_kelas || "")}
          </h2>
          <p className="text-gray-700 font-medium">
            Total Pendaftar:{" "}
            <span className="font-bold text-blue-700">
              {registrants.length}
            </span>{" "}
            /{" "}
            <span className="font-bold text-gray-800">
              {session.kapasitas || 15}
            </span>
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 shadow-lg border border-green-500 font-semibold"
        >
          📥 Export CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-blue-700 font-bold uppercase tracking-wide">
            Total Pendaftar
          </p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {registrants.length}
          </p>
        </div>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-green-700 font-bold uppercase tracking-wide">
            Terverifikasi
          </p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {registrants.filter((r) => r.payment_verified).length}
          </p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-yellow-700 font-bold uppercase tracking-wide">
            Menunggu Verifikasi
          </p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">
            {registrants.filter((r) => !r.payment_verified).length}
          </p>
        </div>
      </div>

      {/* Registrants Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nama / NIM
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status Pembayaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrants.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-600 text-lg font-medium"
                  >
                    📝 Belum ada pendaftar untuk kelas ini
                  </td>
                </tr>
              ) : (
                registrants.map((registrant) => (
                  <tr
                    key={registrant.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {registrant.nama_lengkap}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {registrant.nim}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        📚 {registrant.kelas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        🎓 Semester {registrant.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registrant.payment_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1.5 animate-pulse"></span>
                          ⏳ Menunggu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRegistrant(registrant)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                      >
                        👁️ Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistrant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  Detail Pendaftar
                </h3>
                <button
                  onClick={() => setSelectedRegistrant(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {selectedRegistrant.nama_lengkap}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      NIM
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {selectedRegistrant.nim}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Program Studi
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {selectedRegistrant.prodi}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {selectedRegistrant.semester}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Kelas
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {selectedRegistrant.kelas}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Tanggal Daftar
                    </p>
                    <p className="font-semibold text-gray-900 text-base">
                      {new Date(selectedRegistrant.created_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>

                {selectedRegistrant.bukti_pembayaran && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800 mb-3">
                      💳 Bukti Pembayaran
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedRegistrant.bukti_pembayaran}
                      alt="Bukti Pembayaran"
                      className="max-w-full rounded-lg border-2 border-blue-300 shadow-lg"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  {!selectedRegistrant.payment_verified ? (
                    <>
                      <Button
                        onClick={() =>
                          handleVerifyPayment(selectedRegistrant.id, true)
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✓ Verifikasi Pembayaran
                      </Button>
                      <Button
                        onClick={() =>
                          handleVerifyPayment(selectedRegistrant.id, false)
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >
                        ✗ Tolak Pembayaran
                      </Button>
                    </>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex-1">
                      <p className="text-green-800 font-medium">
                        ✓ Pembayaran sudah terverifikasi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
