import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kelasbios.vercel.app";

  // Create Supabase client
  const supabase = await createClient();

  // Fetch all public classes (status: 'open' or 'closed')
  const { data: classes } = await supabase
    .from("classes")
    .select("slug, updated_at")
    .in("status", ["open", "closed"])
    .order("updated_at", { ascending: false });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2025-01-15"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date("2025-01-15"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];

  // Dynamic class pages
  const classPages: MetadataRoute.Sitemap =
    classes?.map((classItem) => ({
      url: `${baseUrl}/class/${classItem.slug}`,
      lastModified: new Date(classItem.updated_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })) || [];

  return [...staticPages, ...classPages];
}
