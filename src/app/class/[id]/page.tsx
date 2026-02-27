import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  formatDate,
  formatTime,
  formatCurrency,
  getDaysRemaining,
  isUUID,
} from "@/lib/utils";
import Link from "next/link";
import EnrollButton from "./EnrollButton";
import CountdownTimer from "@/components/CountdownTimer";
import MaterialsViewer from "@/components/MaterialsViewer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const queryField = isUUID(id) ? "id" : "slug";
  const { data: classData } = await supabase
    .from("classes")
    .select("*")
    .eq(queryField, id)
    .single();

  if (!classData) {
    return {
      title: "Kelas Tidak Ditemukan",
      description: "Kelas yang Anda cari tidak ditemukan di BIOS LMS.",
    };
  }

  const classDate = formatDate(classData.class_date);
  const classTime = formatTime(classData.class_time);

  return {
    title: `${classData.title} - Kelas ${classDate}`,
    description:
      classData.description ||
      `Daftar kelas ${classData.title} di BIOS LMS. Jadwal: ${classDate} pukul ${classTime}. Platform pembelajaran untuk mahasiswa Teknik Informatika UBM.`,
    keywords: [
      classData.title,
      "Kelas",
      "BIOS UBM",
      "Teknik Informatika",
      "Pembelajaran Online",
      classData.lecturer || "",
    ],
    openGraph: {
      title: `${classData.title} - BIOS LMS`,
      description: classData.description || `Kelas ${classData.title}`,
      url: `https://kelasbios.vercel.app/class/${classData.slug || classData.id}`,
      type: "website",
      images: [
        {
          url: "/logo-bios.svg",
          width: 1200,
          height: 630,
          alt: `${classData.title} - BIOS LMS`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${classData.title} - BIOS LMS`,
      description: classData.description || `Kelas ${classData.title}`,
    },
  };
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Get enrollment count
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, payment_status")
    .eq("class_id", classData.id)
    .eq("payment_status", "verified");

  const enrollmentCount = enrollments?.length || 0;
  const availableSeats = classData.max_participants - enrollmentCount;

  // Check user profile and role
  let userProfile = null;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    userProfile = profile;
    isAdmin = profile?.role === "admin";

    console.log(
      "[Class Detail] User ID:",
      user.id,
      "Role:",
      profile?.role,
      "isAdmin:",
      isAdmin,
    );
  }

  // Check if user is already enrolled
  let userEnrollment = null;
  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("class_id", classData.id)
      .eq("user_id", user.id)
      .single();

    userEnrollment = data;
    console.log(
      "[Class Detail] Enrollment:",
      userEnrollment ? "Yes" : "No",
      "Payment:",
      userEnrollment?.payment_status,
    );
  }

  console.log(
    "[Class Detail] Materials available:",
    classData.materials ? "Yes" : "No",
    "Count:",
    Array.isArray(classData.materials) ? classData.materials.length : 0,
  );
  console.log(
    "[Class Detail] Show MaterialsViewer?",
    isAdmin || (userEnrollment && userEnrollment.payment_status === "verified"),
  );

  const daysRemaining = getDaysRemaining(classData.registration_deadline);
  const isDeadlinePassed = daysRemaining < 0;
  const isFull = availableSeats <= 0;

  // JSON-LD Structured Data for Course/Event
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: classData.title,
    description: classData.description,
    provider: {
      "@type": "Organization",
      name: "BIOS - Universitas Bunda Mulia",
      url: "https://kelasbios.vercel.app",
    },
    instructor: {
      "@type": "Person",
      name: classData.lecturer,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: classData.location || "Online",
      startDate: classData.class_date,
      endDate: classData.end_time || classData.class_date,
      location: {
        "@type": "Place",
        name: classData.location || "Online",
      },
      offers: {
        "@type": "Offer",
        price: classData.price,
        priceCurrency: "IDR",
        availability:
          classData.status === "open" && !isFull && !isDeadlinePassed
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
        validFrom: classData.created_at,
        url: `https://kelasbios.vercel.app/class/${classData.slug || classData.id}`,
      },
    },
    numberOfCredits: 1,
    educationalCredentialAwarded: "Certificate of Completion",
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseSchema),
        }}
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/"
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
            Kembali ke Beranda
          </Link>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-primary-700 via-primary-900 to-accent-600 text-white px-8 py-12">
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
              <p className="text-xl text-primary-100">
                {classData.description}
              </p>
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
                      className="w-6 h-6 mr-3 text-primary-600 mt-0.5"
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
                      <p className="text-gray-900">
                        {formatDate(classData.class_date)}
                      </p>
                      <p className="text-gray-900">
                        Pukul {formatTime(classData.class_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 mr-3 text-primary-600 mt-0.5"
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
                      <p className="text-gray-900">
                        {classData.duration_hours} jam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 mr-3 text-primary-600 mt-0.5"
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
                      <p className="text-gray-900">{classData.classroom}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 mr-3 text-primary-600 mt-0.5"
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
                        className={`font-semibold ${availableSeats < 5 ? "text-orange-600" : "text-gray-900"}`}
                      >
                        {availableSeats} / {classData.max_participants} kursi
                        tersisa
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Informasi Pendaftaran
                  </h2>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Biaya kelas:</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {formatCurrency(10000)}
                    </p>
                  </div>

                  <div className="mb-4 bg-white p-4 rounded-lg border border-primary-200">
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
                      <CountdownTimer
                        deadline={classData.registration_deadline}
                        className="text-sm text-orange-600 mt-1 block"
                      />
                    )}
                    {isDeadlinePassed && (
                      <p className="text-sm text-red-600 font-semibold mt-1">
                        Pendaftaran sudah ditutup
                      </p>
                    )}
                  </div>

                  {!user ? (
                    !isDeadlinePassed && (
                      <Link
                        href="/auth/login"
                        className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        Login untuk Mendaftar
                      </Link>
                    )
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
                        <p
                          className={`font-semibold ${
                            userEnrollment.payment_status === "verified"
                              ? "text-green-900"
                              : userEnrollment.payment_status === "pending"
                                ? "text-yellow-900"
                                : "text-red-900"
                          }`}
                        >
                          {userEnrollment.payment_status === "verified" &&
                            "✓ Anda sudah terdaftar"}
                          {userEnrollment.payment_status === "pending" &&
                            "⏳ Menunggu verifikasi"}
                          {userEnrollment.payment_status === "rejected" &&
                            "✗ Pembayaran ditolak"}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            userEnrollment.payment_status === "verified"
                              ? "text-green-900"
                              : userEnrollment.payment_status === "pending"
                                ? "text-yellow-900"
                                : "text-red-900"
                          }`}
                        >
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
                        className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        Lihat Dashboard
                      </Link>
                    </div>
                  ) : classData.status === "open" &&
                    !isDeadlinePassed &&
                    !isFull ? (
                    <EnrollButton
                      classId={classData.id}
                      userId={user.id}
                      maxParticipants={classData.max_participants}
                      currentEnrollments={enrollmentCount}
                      registrationDeadline={classData.registration_deadline}
                    />
                  ) : (
                    !isDeadlinePassed && (
                      <button
                        disabled
                        className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold"
                      >
                        {isFull ? "Kelas Penuh" : "Tidak Tersedia"}
                      </button>
                    )
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

              {/* Materials Viewer - For enrolled & verified students OR admin */}
              {/* Show for logged in users who are admin OR enrolled */}
              {user && (isAdmin || userEnrollment) && (
                <div className="mb-8">
                  <MaterialsViewer classId={classData.id} />
                </div>
              )}

              {/* Show message if materials exist but user not eligible */}
              {user &&
                !isAdmin &&
                !userEnrollment &&
                classData.materials &&
                Array.isArray(classData.materials) &&
                classData.materials.length > 0 && (
                  <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <svg
                        className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                          Materi Tersedia
                        </h3>
                        <p className="text-yellow-800">
                          Kelas ini memiliki materi pembelajaran. Daftar
                          terlebih dahulu untuk mengakses materi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
