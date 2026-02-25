import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  formatDate,
  formatTime,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import PaymentVerification from "./PaymentVerification";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/403");
  }

  // Get all enrollments with pending payments
  const { data: pendingEnrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      classes(*),
      profiles:user_id(full_name, email)
    `,
    )
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });

  // Get verified enrollments count per class for capacity check
  const classEnrollmentCounts: Record<string, number> = {};
  if (pendingEnrollments) {
    for (const enrollment of pendingEnrollments) {
      const classId = enrollment.class_id;
      const { data } = await supabase
        .from("enrollments")
        .select("id")
        .eq("class_id", classId)
        .eq("payment_status", "verified");
      classEnrollmentCounts[classId] = data?.length || 0;
    }
  }

  // Get verified enrollments
  const { data: verifiedEnrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      classes(*),
      profiles:user_id(full_name, email)
    `,
    )
    .eq("payment_status", "verified")
    .order("verified_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verifikasi Pembayaran
          </h1>
          <p className="text-gray-600">
            Verifikasi bukti pembayaran dari peserta kelas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Menunggu Verifikasi</p>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingEnrollments?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Terverifikasi</p>
            <p className="text-3xl font-bold text-green-600">
              {verifiedEnrollments?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency((verifiedEnrollments?.length || 0) * 10000)}
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        {pendingEnrollments && pendingEnrollments.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Menunggu Verifikasi ({pendingEnrollments.length})
            </h2>
            <div className="space-y-4">
              {pendingEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Info */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Informasi Peserta
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-primary-600">
                          {(enrollment.profiles as any)?.full_name}
                        </p>
                        <p className="text-gray-600">
                          {(enrollment.profiles as any)?.email}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Daftar: {formatDateTime(enrollment.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Class Info */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Informasi Kelas
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">
                          {(enrollment.classes as any)?.title}
                        </p>
                        <p className="text-gray-600">
                          {formatDate((enrollment.classes as any)?.class_date)}{" "}
                          •{" "}
                          {formatTime((enrollment.classes as any)?.class_time)}
                        </p>
                        <p className="text-gray-600">
                          Ruangan: {(enrollment.classes as any)?.classroom}
                        </p>
                        <p className="font-bold text-primary-600 mt-2">
                          {formatCurrency(10000)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Proof */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Bukti Pembayaran
                      </h3>
                      {enrollment.payment_proof ? (
                        <div className="space-y-3">
                          <a
                            href={enrollment.payment_proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={enrollment.payment_proof}
                              alt="Payment Proof"
                              className="w-full h-40 object-cover rounded-lg border border-gray-300 hover:opacity-90 transition-opacity cursor-pointer"
                            />
                          </a>
                          <PaymentVerification
                            enrollmentId={enrollment.id}
                            adminId={user.id}
                            classId={enrollment.class_id}
                            maxParticipants={
                              (enrollment.classes as any)?.max_participants || 0
                            }
                            currentVerified={
                              classEnrollmentCounts[enrollment.class_id] || 0
                            }
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Belum ada bukti pembayaran
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center mb-8">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tidak Ada Pembayaran Pending
            </h3>
            <p className="text-gray-600">Semua pembayaran sudah diverifikasi</p>
          </div>
        )}

        {/* Recently Verified */}
        {verifiedEnrollments && verifiedEnrollments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Terverifikasi Terakhir
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peserta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diverifikasi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {verifiedEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {(enrollment.profiles as any)?.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(enrollment.profiles as any)?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {(enrollment.classes as any)?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(
                              (enrollment.classes as any)?.class_date,
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary-600">
                            {formatCurrency(10000)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {enrollment.verified_at
                              ? formatDateTime(enrollment.verified_at)
                              : "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
