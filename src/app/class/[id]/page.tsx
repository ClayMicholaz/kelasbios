import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  formatDate,
  formatTime,
  formatCurrency,
  getDaysRemaining,
} from "@/lib/utils";
import Link from "next/link";
import EnrollButton from "./EnrollButton";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get class details
  const { data: classData, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !classData) {
    notFound();
  }

  // Get enrollment count
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, payment_status")
    .eq("class_id", params.id)
    .eq("payment_status", "verified");

  const enrollmentCount = enrollments?.length || 0;
  const availableSeats = classData.max_participants - enrollmentCount;

  // Check if user is already enrolled
  let userEnrollment = null;
  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("class_id", params.id)
      .eq("user_id", user.id)
      .single();

    userEnrollment = data;
  }

  const daysRemaining = getDaysRemaining(classData.registration_deadline);
  const isDeadlinePassed = daysRemaining < 0;
  const isFull = availableSeats <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/"
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
          Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-8 py-12">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                {classData.title}
              </h1>
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
            <p className="text-xl text-indigo-100">{classData.description}</p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Detail Kelas
                </h2>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Tanggal & Waktu
                    </p>
                    <p className="text-gray-600">
                      {formatDate(classData.class_date)}
                    </p>
                    <p className="text-gray-600">
                      Pukul {formatTime(classData.class_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Durasi</p>
                    <p className="text-gray-600">
                      {classData.duration_hours} jam
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Ruangan</p>
                    <p className="text-gray-600">{classData.classroom}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-indigo-600 mt-0.5"
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
                  <div>
                    <p className="font-semibold text-gray-900">Kapasitas</p>
                    <p
                      className={`font-semibold ${availableSeats < 5 ? "text-orange-600" : "text-gray-600"}`}
                    >
                      {availableSeats} / {classData.max_participants} kursi
                      tersisa
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Informasi Pendaftaran
                </h2>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Biaya kelas:</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatCurrency(10000)}
                  </p>
                </div>

                <div className="mb-4 bg-white p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Detail Transfer:
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Bank:</strong>{" "}
                      {process.env.NEXT_PUBLIC_BANK_NAME || "Bank Jago"}
                    </p>
                    <p>
                      <strong>No. Rekening:</strong>{" "}
                      {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ||
                        "100271468145"}
                    </p>
                    <p>
                      <strong>Atas Nama:</strong>{" "}
                      {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ||
                        "Christoper Harris"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Batas pendaftaran:
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(classData.registration_deadline)}
                  </p>
                  {!isDeadlinePassed && (
                    <p className="text-sm text-orange-600 mt-1">
                      {daysRemaining > 0
                        ? `${daysRemaining} hari lagi`
                        : "Hari ini!"}
                    </p>
                  )}
                </div>

                {!user ? (
                  <Link
                    href="/auth/login"
                    className="block w-full text-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Login untuk Mendaftar
                  </Link>
                ) : userEnrollment ? (
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-lg ${
                        userEnrollment.payment_status === "verified"
                          ? "bg-green-100 border border-green-300"
                          : userEnrollment.payment_status === "pending"
                            ? "bg-yellow-100 border border-yellow-300"
                            : "bg-red-100 border border-red-300"
                      }`}
                    >
                      <p className="font-semibold">
                        {userEnrollment.payment_status === "verified" &&
                          "✓ Anda sudah terdaftar"}
                        {userEnrollment.payment_status === "pending" &&
                          "⏳ Menunggu verifikasi"}
                        {userEnrollment.payment_status === "rejected" &&
                          "✗ Pembayaran ditolak"}
                      </p>
                      <p className="text-sm mt-1">
                        {userEnrollment.payment_status === "verified" &&
                          "Sampai jumpa di kelas!"}
                        {userEnrollment.payment_status === "pending" &&
                          "Pembayaran Anda sedang diverifikasi"}
                        {userEnrollment.payment_status === "rejected" &&
                          "Silakan hubungi admin"}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block w-full text-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Lihat Dashboard
                    </Link>
                  </div>
                ) : classData.status === "open" &&
                  !isDeadlinePassed &&
                  !isFull ? (
                  <EnrollButton classId={classData.id} userId={user.id} />
                ) : (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold"
                  >
                    {isDeadlinePassed
                      ? "Pendaftaran Ditutup"
                      : isFull
                        ? "Kelas Penuh"
                        : "Tidak Tersedia"}
                  </button>
                )}
              </div>
            </div>

            {/* Topics Section */}
            {classData.materials &&
              Array.isArray(classData.materials) &&
              classData.materials.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Yang Akan Dipelajari
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <ul className="space-y-3">
                      {classData.materials.map(
                        (material: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="w-6 h-6 mr-3 text-green-500 shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-700">
                              {material.name || material}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
