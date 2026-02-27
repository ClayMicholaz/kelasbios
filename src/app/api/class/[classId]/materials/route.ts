import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/class/[classId]/materials
 * Fetch class materials - only accessible if:
 * 1. User is enrolled and payment is verified
 * 2. Class has started (current time >= class start time)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { classId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    console.log("[API Materials] User:", user.id, "Role:", profile?.role);

    // Fetch class data
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Admin can access all materials anytime, skip enrollment and time checks
    if (!isAdmin) {
      // Check if user is enrolled and payment is verified
      const { data: enrollment, error: enrollError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .single();

      if (enrollError || !enrollment) {
        return NextResponse.json(
          { error: "You are not enrolled in this class" },
          { status: 403 },
        );
      }

      if (enrollment.payment_status !== "verified") {
        return NextResponse.json(
          { error: "Payment not verified yet" },
          { status: 403 },
        );
      }

      // Check if class has started
      const now = new Date();
      const classDateTime = new Date(
        `${classData.class_date}T${classData.class_time}`,
      );

      if (now < classDateTime) {
        return NextResponse.json(
          {
            error: "Materials not available yet",
            message:
              "Class has not started yet. Materials will be available when class begins.",
            classStartTime: classDateTime.toISOString(),
          },
          { status: 403 },
        );
      }
    }

    // Fetch materials from storage
    const materials = classData.materials as Array<{
      name: string;
      url: string | null;
    }> | null;

    console.log(
      "[API Materials] Class:",
      classId,
      "Materials count:",
      materials?.length || 0,
    );

    if (!materials || materials.length === 0) {
      return NextResponse.json(
        { materials: [], message: "No materials available for this class" },
        { status: 200 },
      );
    }

    // Filter materials that have URLs (uploaded to storage)
    const materialsWithContent = await Promise.all(
      materials
        .filter((m) => m.url)
        .map(async (material) => {
          try {
            // Check file extension from URL or name
            const fileName = material.name.toLowerCase();
            const urlLower = material.url!.toLowerCase();
            const isMarkdown =
              fileName.endsWith(".md") || urlLower.endsWith(".md");
            const isPDF =
              fileName.endsWith(".pdf") || urlLower.endsWith(".pdf");

            // For markdown files, download and read content for in-browser viewing
            if (isMarkdown) {
              try {
                // Extract the storage path from Supabase URL
                // URL format: https://{project}.supabase.co/storage/v1/object/public/class-materials/RANGKUMAN_PBO.md
                // We need just the filename after class-materials/
                let storagePath = material.url!;

                console.log("[API Materials] Original URL:", material.url);

                // If it's a full URL, extract just the path after bucket name
                if (
                  storagePath.includes(
                    "/storage/v1/object/public/class-materials/",
                  )
                ) {
                  // Split by the bucket path and take everything after it
                  const parts = storagePath.split(
                    "/storage/v1/object/public/class-materials/",
                  );
                  storagePath = parts[1];
                } else if (storagePath.startsWith("class-materials/")) {
                  // If it starts with bucket name, remove it
                  storagePath = storagePath.replace("class-materials/", "");
                }

                // Decode URL encoding (e.g., %20 to space)
                storagePath = decodeURIComponent(storagePath);

                console.log("[API Materials] Extracted path:", storagePath);

                // Download file from storage
                const { data: fileData, error: downloadError } =
                  await supabase.storage
                    .from("class-materials")
                    .download(storagePath);

                if (downloadError) {
                  console.error(
                    "[API Materials] Download error:",
                    downloadError,
                    "for path:",
                    storagePath,
                  );
                  console.error(
                    "[API Materials] Error details:",
                    JSON.stringify(downloadError),
                  );
                  return {
                    name: material.name,
                    content: null,
                    type: "markdown",
                    error: `Failed to load: ${downloadError.message}`,
                  };
                }

                // Read file content as text
                const content = await fileData.text();

                console.log(
                  "[API Materials] ✓ Successfully loaded:",
                  material.name,
                  `(${content.length} chars)`,
                );

                // Return markdown content WITHOUT url (prevent download)
                return {
                  name: material.name,
                  content,
                  type: "markdown",
                };
              } catch (error: any) {
                console.error("[API Materials] Exception:", error);
                return {
                  name: material.name,
                  content: null,
                  type: "markdown",
                  error: `Failed: ${error.message || "Unknown error"}`,
                };
              }
            }

            // For PDF files, return URL for download ONLY
            if (isPDF) {
              return {
                name: material.name,
                url: material.url,
                content: null,
                type: "pdf",
              };
            }

            // For other file types, return URL for download
            return {
              name: material.name,
              url: material.url,
              content: null,
              type: "file",
            };
          } catch (error) {
            console.error("[API Materials] Error processing material:", error);
            return {
              name: material.name,
              content: null,
              error: "Failed to process material",
            };
          }
        }),
    );

    return NextResponse.json(
      {
        materials: materialsWithContent,
        classTitle: classData.title,
        classDate: classData.class_date,
        isAdminPreview: isAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API Materials] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
