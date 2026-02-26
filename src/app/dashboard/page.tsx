import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import PaymentUpload from "./PaymentUpload";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let profile = profileData;

  console.log("Dashboard - Profile check:", {
    profile,
    profileError,
    userId: user.id,
  });

  // If profile doesn't exist, create it
  const profileNotFound =
    !profile || (profileError && profileError.code === "PGRST116");

  if (profileNotFound && user.email) {
    console.log("Dashboard - Creating profile for:", user.email);

    // Extract NIM from email (8 digits)
    const emailPrefix = user.email.split("@")[0];
    const nimMatch = emailPrefix.match(/\d{8}/);
    const nim = nimMatch ? nimMatch[0] : "";

    // Get full_name from user metadata (Google OAuth provides this)
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    console.log("Dashboard - Inserting profile:", {
      full_name: fullName,
      nim: nim,
      email: user.email,
    });

    // Default role is 'member', admin role harus diset manual via SQL
    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        nim: nim,
        role: "member", // Always create as member, admin diset manual
      })
      .select()
      .single();

    console.log("Dashboard - Profile insert result:", {
      insertData,
      insertError,
    });

    if (insertError) {
      console.error("Dashboard - Failed to create profile:", insertError);
      // Continue even if insert fails - might be race condition
    } else {
      // Use the newly inserted profile
      profile = insertData;
    }
  }

  // If profile exists but missing data, update it
  if (profile && user.user_metadata) {
    const needsUpdate =
      !profile.full_name || profile.full_name === "User" || !profile.nim;

    if (needsUpdate) {
      console.log("Dashboard - Updating incomplete profile");

      const emailPrefix = user.email!.split("@")[0];
      const nimMatch = emailPrefix.match(/\d{8}/);
      const nim = nimMatch ? nimMatch[0] : profile.nim || "";

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        profile.full_name ||
        user.email?.split("@")[0] ||
        "User";

      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          nim: nim,
        })
        .eq("id", user.id);

      // Re-fetch updated profile
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (updatedProfile) {
        profile = updatedProfile;
      }
    }
  }

  // Use full name from profile, fallback to user metadata or email
  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email;

  // Get user enrollments with class details
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      classes (*)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Separate enrollments by status
  const awaitingPayment =
    enrollments?.filter(
      (e) => e.payment_status === "pending" && !e.payment_proof,
    ) || [];
  const pendingVerification =
    enrollments?.filter(
      (e) => e.payment_status === "pending" && e.payment_proof,
    ) || [];
  const verifiedClasses =
    enrollments?.filter((e) => e.payment_status === "verified") || [];
  const rejectedPayments =
    enrollments?.filter((e) => e.payment_status === "rejected") || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Saya
          </h1>
          <p className="text-gray-600">
            Selamat datang, <span className="font-semibold">{displayName}</span>
            !
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kelas Aktif</p>
                <p className="text-3xl font-bold text-primary-600">
                  {verifiedClasses.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Menunggu Verifikasi
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {pendingVerification.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Kelas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrollments?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Awaiting Payment - Belum Upload Bukti */}
        {awaitingPayment.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Menunggu Pembayaran
            </h2>
            <div className="space-y-4">
              {awaitingPayment.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Menunggu Upload
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {(enrollment.classes as any)?.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">Tanggal:</span>{" "}
                          {formatDate((enrollment.classes as any)?.class_date)}{" "}
                          •{" "}
                          {formatTime((enrollment.classes as any)?.class_time)}
                        </p>
                        <p>
                          <span className="font-semibold">Ruangan:</span>{" "}
                          {(enrollment.classes as any)?.classroom}
                        </p>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          {formatCurrency(10000)}
                        </p>
                      </div>
                    </div>
                    <div className="md:ml-6">
                      <PaymentUpload enrollmentId={enrollment.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Verification - Sudah Upload, Menunggu Verifikasi Admin */}
        {pendingVerification.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Menunggu Verifikasi Admin
            </h2>
            <div className="space-y-4">
              {pendingVerification.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Sedang Diverifikasi
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {(enrollment.classes as any)?.title}
                      </h3>
                      <p className="text-sm text-blue-900 font-medium mb-2">
                        Bukti pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu.
                      </p>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">Tanggal:</span>{" "}
                          {formatDate((enrollment.classes as any)?.class_date)}{" "}
                          •{" "}
                          {formatTime((enrollment.classes as any)?.class_time)}
                        </p>
                        <p>
                          <span className="font-semibold">Ruangan:</span>{" "}
                          {(enrollment.classes as any)?.classroom}
                        </p>
                        <p>
                          <span className="font-semibold">Upload:</span>{" "}
                          {enrollment.payment_date
                            ? formatDate(enrollment.payment_date)
                            : "-"}
                        </p>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          {formatCurrency(10000)}
                        </p>
                      </div>
                    </div>
                    {enrollment.payment_proof && (
                      <div className="md:ml-6 flex items-center">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 text-blue-500 mx-auto mb-2"
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
                          <p className="text-xs text-blue-900 font-medium">
                            Bukti Telah Diupload
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Payments */}
        {rejectedPayments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pembayaran Ditolak
            </h2>
            <div className="space-y-4">
              {rejectedPayments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-red-50 border-2 border-red-300 rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Ditolak
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {(enrollment.classes as any)?.title}
                      </h3>
                      <p className="text-sm text-red-900 font-medium mb-2">
                        Pembayaran Anda ditolak. Silakan upload ulang bukti
                        pembayaran yang valid.
                      </p>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">Tanggal:</span>{" "}
                          {formatDate((enrollment.classes as any)?.class_date)}{" "}
                          •{" "}
                          {formatTime((enrollment.classes as any)?.class_time)}
                        </p>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          {formatCurrency(10000)}
                        </p>
                      </div>
                    </div>
                    <div className="md:ml-6">
                      <PaymentUpload enrollmentId={enrollment.id} isReupload />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Classes */}
        {verifiedClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kelas Saya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verifiedClasses.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {(enrollment.classes as any)?.title}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Terverifikasi
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {(enrollment.classes as any)?.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        {formatDate((enrollment.classes as any)?.class_date)} •{" "}
                        {formatTime((enrollment.classes as any)?.class_time)}
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        {(enrollment.classes as any)?.classroom}
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        {(enrollment.classes as any)?.duration_hours} jam
                      </div>
                    </div>

                    {enrollment.attended && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-semibold">
                          ✓ Anda telah hadir di kelas ini
                        </p>
                      </div>
                    )}

                    <Link
                      href={`/class/${(enrollment.classes as any)?.id}/materials`}
                      className="mt-4 block w-full px-4 py-2 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Lihat Materi & Latihan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {enrollments?.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Kelas Terdaftar
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum mendaftar di kelas manapun. Jelajahi kelas yang
              tersedia dan mulai belajar!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Jelajahi Kelas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
