import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PracticeQuiz from "./PracticeQuiz";
import SecureDownloadButton from "./SecureDownloadButton";
import { isUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClassMaterialsPage({
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

  // Check user profile and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Check if user is enrolled and verified (skip for admin)
  let enrollment = null;
  if (!isAdmin) {
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select("*")
      .eq("class_id", classData.id)
      .eq("user_id", user.id)
      .eq("payment_status", "verified")
      .single();

    enrollment = enrollmentData;

    if (!enrollment) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Akses Ditolak
              </h1>
              <p className="text-gray-600 mb-6">
                Anda belum terdaftar atau pembayaran Anda belum diverifikasi
                untuk kelas ini.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  const materials = classData.materials as Array<{
    name: string;
    url?: string;
  }> | null;
  const practiceQuestions = classData.practice_questions as Array<{
    question: string;
    options: string[];
    answer: string;
  }> | null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
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

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {classData.title}
              </h1>
              <p className="text-gray-600">{classData.description}</p>
            </div>
            {isAdmin && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full shrink-0">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Materials Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
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
            Materi Pembelajaran
          </h2>

          {materials && materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((material, index) => {
                // Determine file type
                const isMarkdown =
                  material.url?.endsWith(".md") ||
                  material.name.endsWith(".md");
                const isPDF =
                  material.url?.endsWith(".pdf") ||
                  material.name.endsWith(".pdf");

                // Render markdown as clickable link to preview
                if (isMarkdown && material.url) {
                  return (
                    <Link
                      key={index}
                      href={`/class/${id}/material/${index}`}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors group"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-8 h-8 text-primary-600 mr-3 group-hover:text-primary-700"
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
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-primary-700">
                            {material.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Markdown - Klik untuk melihat
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  );
                }

                // Render PDF/other files with download button
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      {isPDF ? (
                        <svg
                          className="w-8 h-8 text-red-500 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-500 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {material.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isPDF
                            ? "File PDF"
                            : material.url
                              ? "File"
                              : "Topik Pembelajaran"}
                        </p>
                      </div>
                    </div>
                    {material.url && (
                      <SecureDownloadButton
                        url={material.url}
                        fileName={material.name}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
              <p className="text-gray-500">Belum ada materi yang tersedia</p>
            </div>
          )}
        </div>

        {/* Practice Questions Section */}
        {practiceQuestions && practiceQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Soal Latihan
            </h2>
            <PracticeQuiz questions={practiceQuestions} />
          </div>
        )}
      </div>
    </div>
  );
}
