import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime, formatCurrency, isUUID } from "@/lib/utils";
import AttendanceCheck from "./AttendanceCheck";

export const dynamic = "force-dynamic";

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Get class details - support both UUID and slug
  const queryField = isUUID(id) ? "id" : "slug";
  const { data: classData, error } = await supabase
    .from("classes")
    .select("*")
    .eq(queryField, id)
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
    .eq("class_id", classData.id)
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
              <p className="font-semibold text-gray-900">
                {formatDate(classData.class_date)}
              </p>
              <p className="font-semibold text-gray-900">
                {formatTime(classData.class_time)}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Ruangan</p>
              <p className="font-semibold text-gray-900">{classData.classroom}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Durasi</p>
              <p className="font-semibold text-gray-900">{classData.duration_hours} jam</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Kapasitas</p>
              <p className="font-semibold text-gray-900">
                {verifiedEnrollments.length} / {classData.max_participants}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Total Terdaftar
            </p>
            <p className="text-3xl font-bold text-primary-600">
              {verifiedEnrollments.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">Hadir</p>
            <p className="text-3xl font-bold text-green-600">{attendedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Belum Hadir
            </p>
            <p className="text-3xl font-bold text-orange-600">
              {verifiedEnrollments.length - attendedCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">Pending</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
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
                        {enrollment.whatsapp_number ? (
                          <a
                            href={`https://wa.me/62${enrollment.whatsapp_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            +62{enrollment.whatsapp_number}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Tidak ada
                          </span>
                        )}
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
                              <p className="text-xs text-gray-600 mt-1 font-medium">
                                {new Date(
                                  enrollment.attended_at,
                                ).toLocaleString("id-ID", {
                                  timeZone: "Asia/Jakarta",
                                })}
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
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
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
