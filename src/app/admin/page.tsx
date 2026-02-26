import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
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

  // Get statistics
  const { data: classes } = await supabase.from("classes").select("id, status");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, payment_status");

  const { data: profiles } = await supabase.from("profiles").select("id");

  const totalClasses = classes?.length || 0;
  const openClasses = classes?.filter((c) => c.status === "open").length || 0;
  const pendingPayments =
    enrollments?.filter((e) => e.payment_status === "pending").length || 0;
  const totalMembers = profiles?.length || 0;

  // Get recent classes
  const { data: recentClasses } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get pending enrollments with details
  const { data: pendingEnrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      classes(title),
      profiles:user_id(full_name, email)
    `,
    )
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-linear-to-r from-primary-700 via-primary-900 to-accent-600 text-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-white/90">
            Kelola kelas, verifikasi pembayaran, dan pantau sistem
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Kelas</p>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
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
            <p className="text-3xl font-bold text-gray-900">{totalClasses}</p>
            <p className="text-sm text-green-600 mt-1">
              {openClasses} kelas dibuka
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending Verifikasi</p>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600"
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
            <p className="text-3xl font-bold text-gray-900">
              {pendingPayments}
            </p>
            <Link
              href="/admin/payments"
              className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Member</p>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
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
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Enrolled</p>
              <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent-600"
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
            <p className="text-3xl font-bold text-gray-900">
              {enrollments?.length || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/classes/create"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-600"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Buat Kelas Baru</h3>
                <p className="text-sm text-gray-600">Tambah kelas baru</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-600"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-yellow-600"
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
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Verifikasi Pembayaran
                </h3>
                <p className="text-sm text-gray-600">
                  {pendingPayments} pending
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/classes"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-600"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Kelola Kelas</h3>
                <p className="text-sm text-gray-600">Lihat semua kelas</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Classes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Kelas Terbaru</h2>
              <Link
                href="/admin/classes"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Lihat semua →
              </Link>
            </div>
            <div className="space-y-3">
              {recentClasses && recentClasses.length > 0 ? (
                recentClasses.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/admin/classes/${cls.slug || cls.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {cls.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {cls.classroom}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          cls.status === "open"
                            ? "bg-green-100 text-green-800"
                            : cls.status === "closed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {cls.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Belum ada kelas
                </p>
              )}
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Verifikasi
              </h2>
              <Link
                href="/admin/payments"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Lihat semua →
              </Link>
            </div>
            <div className="space-y-3">
              {pendingEnrollments && pendingEnrollments.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {pendingEnrollments.map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      href={`/admin/payments`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors mb-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {(enrollment.profiles as any)?.full_name ||
                              (enrollment.profiles as any)?.email}
                          </h3>
                          <p className="text-sm text-gray-900 font-medium mt-1">
                            {(enrollment.classes as any)?.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(enrollment.created_at).toLocaleDateString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada pending payment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
