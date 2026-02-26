import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import ClassCard from "@/components/ClassCard";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
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

  // Get all classes
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("class_date", { ascending: false });

  // Calculate enrollment count for each class using direct count query
  // This ensures consistency with user-facing enrollment counts
  const classesWithCount = [];
  if (classes) {
    for (const classItem of classes) {
      const { data: verifiedEnrollments } = await supabase
        .from("enrollments")
        .select("id")
        .eq("class_id", classItem.id)
        .eq("payment_status", "verified");

      classesWithCount.push({
        ...classItem,
        enrollment_count: verifiedEnrollments?.length || 0,
      });
    }
  }

  const openClasses = classesWithCount.filter((c) => c.status === "open");
  const closedClasses = classesWithCount.filter((c) => c.status === "closed");
  const completedClasses = classesWithCount.filter(
    (c) => c.status === "completed",
  );

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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manajemen Kelas
            </h1>
            <p className="text-gray-600">Kelola semua kelas yang tersedia</p>
          </div>
          <Link
            href="/admin/classes/create"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Buat Kelas Baru
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Kelas Dibuka</p>
            <p className="text-3xl font-bold text-green-600">
              {openClasses.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Kelas Ditutup</p>
            <p className="text-3xl font-bold text-red-600">
              {closedClasses.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Kelas Selesai</p>
            <p className="text-3xl font-bold text-gray-600">
              {completedClasses.length}
            </p>
          </div>
        </div>

        {/* Open Classes */}
        {openClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kelas Dibuka ({openClasses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openClasses.map((classItem) => (
                <div key={classItem.id}>
                  <ClassCard classData={classItem} showEnrollButton={false} />
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/admin/classes/${classItem.slug || classItem.id}`}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center text-sm font-medium"
                    >
                      Detail & Absensi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closed Classes */}
        {closedClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kelas Ditutup ({closedClasses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedClasses.map((classItem) => (
                <div key={classItem.id}>
                  <ClassCard classData={classItem} showEnrollButton={false} />
                  <Link
                    href={`/admin/classes/${classItem.slug || classItem.id}`}
                    className="mt-2 block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium"
                  >
                    Lihat Detail
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Classes */}
        {completedClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kelas Selesai ({completedClasses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedClasses.map((classItem) => (
                <div key={classItem.id}>
                  <ClassCard classData={classItem} showEnrollButton={false} />
                  <Link
                    href={`/admin/classes/${classItem.slug || classItem.id}`}
                    className="mt-2 block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium"
                  >
                    Lihat Detail
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {classesWithCount.length === 0 && (
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
              Belum Ada Kelas
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai dengan membuat kelas pertama Anda
            </p>
            <Link
              href="/admin/classes/create"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Buat Kelas Baru
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
