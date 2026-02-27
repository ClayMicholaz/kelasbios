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

    // Fetch class data
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

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

    // Fetch materials from storage
    const materials = classData.materials as Array<{
      name: string;
      url: string | null;
    }> | null;

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
            const isMarkdown = material.url!.endsWith(".md");

            // For markdown files, download and read content for viewer
            if (isMarkdown) {
              // Extract path from URL
              const urlPath = material.url!.split(
                "/storage/v1/object/public/",
              )[1];

              // Download file from storage
              const { data: fileData, error: downloadError } =
                await supabase.storage
                  .from("class-materials")
                  .download(urlPath.replace("class-materials/", ""));

              if (downloadError) {
                console.error("[API Materials] Download error:", downloadError);
                return {
                  name: material.name,
                  url: material.url,
                  content: null,
                  type: "markdown",
                  error: "Failed to load material",
                };
              }

              // Read file content as text
              const content = await fileData.text();

              return {
                name: material.name,
                url: material.url,
                content,
                type: "markdown",
              };
            }

            // For non-markdown files (PDF, etc), just return URL for download
            return {
              name: material.name,
              url: material.url,
              content: null,
              type: "file", // PDF or other file type
            };
          } catch (error) {
            console.error("[API Materials] Error processing material:", error);
            return {
              name: material.name,
              url: material.url,
              content: null,
              error: "Failed to load material",
            };
          }
        }),
    );

    return NextResponse.json(
      {
        materials: materialsWithContent,
        classTitle: classData.title,
        classDate: classData.class_date,
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
