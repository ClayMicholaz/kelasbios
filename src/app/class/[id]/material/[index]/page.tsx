import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { isUUID } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Material {
  name: string;
  url: string | null;
}

export default async function MaterialPreviewPage({
  params,
}: {
  params: Promise<{ id: string; index: string }>;
}) {
  const { id, index } = await params;
  const materialIndex = parseInt(index);

  if (isNaN(materialIndex) || materialIndex < 0) {
    notFound();
  }

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
  if (!isAdmin) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("class_id", classData.id)
      .eq("user_id", user.id)
      .eq("payment_status", "verified")
      .single();

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

    // Check if class has started (skip for admin)
    const now = new Date();
    const classDateTime = new Date(
      `${classData.class_date}T${classData.class_time}`,
    );

    if (now < classDateTime) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg
                className="w-16 h-16 text-yellow-500 mx-auto mb-4"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Materi Belum Tersedia
              </h1>
              <p className="text-gray-600 mb-6">
                Materi akan tersedia setelah kelas dimulai.
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

  // Get materials
  const materials = (classData.materials as Material[]) || [];

  if (materialIndex >= materials.length) {
    notFound();
  }

  const material = materials[materialIndex];

  // Check if it's a markdown file
  const isMarkdown =
    material.url?.endsWith(".md") || material.name.endsWith(".md");

  if (!isMarkdown || !material.url) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Hanya Markdown yang Dapat Ditampilkan
            </h1>
            <p className="text-gray-600 mb-6">
              Materi ini bukan file markdown atau tidak tersedia untuk preview.
            </p>
            <Link
              href={`/class/${id}/materials`}
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Kembali ke Materi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch markdown content from storage
  let markdownContent = "";
  let loadError = null;

  try {
    const fetchUrl = material.url;
    console.log("[Material Preview] Fetching URL:", fetchUrl);
    console.log("[Material Preview] ClassId:", classData.id);

    const response = await fetch(fetchUrl, {
      method: "GET",
      cache: "no-store",
    });

    console.log("[Material Preview] Response status:", response.status);
    console.log("[Material Preview] Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Material Preview] Error response body:", errorText);
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}. Body: ${errorText}`,
      );
    }

    markdownContent = await response.text();
    console.log(
      "[Material Preview] Successfully loaded markdown, length:",
      markdownContent.length,
    );
  } catch (err: any) {
    console.error("[Material Preview] Error loading markdown:", err);
    loadError = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/class/${id}/materials`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
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
            Kembali ke Materi
          </Link>
          {isAdmin && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
              Admin Preview
            </span>
          )}
        </div>

        {/* Material content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Title bar */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white px-6 py-4">
            <h1 className="text-2xl font-bold flex items-center">
              <svg
                className="w-6 h-6 mr-3"
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
              {material.name}
            </h1>
            <p className="text-primary-100 text-sm mt-1">{classData.title}</p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {loadError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-red-600 mt-0.5 mr-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">
                      Gagal Memuat Materi
                    </h3>
                    <p className="text-red-700 mt-1">{loadError}</p>
                  </div>
                </div>
              </div>
            ) : (
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {markdownContent}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
