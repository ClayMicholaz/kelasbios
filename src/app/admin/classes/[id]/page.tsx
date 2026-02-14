import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import AttendanceCheck from "./AttendanceCheck";

export const dynamic = "force-dynamic";

export default async function AdminClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Get class details
  const { data: classData, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !classData) {
    notFound();
  }

  // Get enrollments with user details
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      profiles:user_id(full_name, email)
    `,
    )
    .eq("class_id", params.id)
    .order("created_at", { ascending: true });

  const verifiedEnrollments =
    enrollments?.filter((e) => e.payment_status === "verified") || [];
  const pendingEnrollments =
    enrollments?.filter((e) => e.payment_status === "pending") || [];
  const attendedCount = verifiedEnrollments.filter((e) => e.attended).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/classes"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
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
          Kembali ke Daftar Kelas
        </Link>

        {/* Class Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {classData.title}
              </h1>
              <p className="text-gray-600">{classData.description}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                classData.status === "open"
                  ? "bg-green-100 text-green-800"
                  : classData.status === "closed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {classData.status === "open"
                ? "Buka"
                : classData.status === "closed"
                  ? "Tutup"
                  : "Selesai"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Tanggal & Waktu</p>
              <p className="font-semibold">
                {formatDate(classData.class_date)}
              </p>
              <p className="font-semibold">
                {formatTime(classData.class_time)}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Ruangan</p>
              <p className="font-semibold">{classData.classroom}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Durasi</p>
              <p className="font-semibold">{classData.duration_hours} jam</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Kapasitas</p>
              <p className="font-semibold">
                {verifiedEnrollments.length} / {classData.max_participants}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Terdaftar</p>
            <p className="text-3xl font-bold text-indigo-600">
              {verifiedEnrollments.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Hadir</p>
            <p className="text-3xl font-bold text-green-600">{attendedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Belum Hadir</p>
            <p className="text-3xl font-bold text-orange-600">
              {verifiedEnrollments.length - attendedCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingEnrollments.length}
            </p>
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Daftar Peserta ({verifiedEnrollments.length})
          </h2>

          {verifiedEnrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verifiedEnrollments.map((enrollment, index) => (
                    <tr
                      key={enrollment.id}
                      className={
                        enrollment.attended ? "bg-green-50" : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {(enrollment.profiles as any)?.full_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {(enrollment.profiles as any)?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Terverifikasi
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enrollment.attended ? (
                          <div>
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              ✓ Hadir
                            </span>
                            {enrollment.attended_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  enrollment.attended_at,
                                ).toLocaleString("id-ID")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Belum Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <AttendanceCheck
                          enrollmentId={enrollment.id}
                          attended={enrollment.attended}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Peserta
              </h3>
              <p className="text-gray-600">
                Belum ada peserta yang terverifikasi untuk kelas ini
              </p>
            </div>
          )}
        </div>

        {/* Pending Payments */}
        {pendingEnrollments.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Pending Verifikasi ({pendingEnrollments.length})
            </h3>
            <div className="space-y-2">
              {pendingEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex justify-between items-center bg-white p-3 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {(enrollment.profiles as any)?.full_name ||
                        (enrollment.profiles as any)?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(enrollment.profiles as any)?.email}
                    </p>
                  </div>
                  <Link
                    href="/admin/payments"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Verifikasi
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
