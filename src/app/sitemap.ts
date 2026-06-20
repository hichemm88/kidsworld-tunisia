import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://kidsworld-tunisia.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const VILLES = [
    "tunis", "ariana", "les-berges-du-lac", "la-marsa",
    "ben-arous", "la-soukra", "ennasr", "el-menzah", "manouba",
  ];

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/tarifs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/listings?cat=sante`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/listings?cat=education`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/listings?cat=loisirs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/listings?cat=ateliers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/listings?cat=fetes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/listings?cat=shopping`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...VILLES.map((v) => ({
      url: `${BASE_URL}/activites/${v}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];

  try {
    const { data: listings } = await supabase
      .from("listings")
      .select("slug, updated_at")
      .eq("is_active", true);

    const listingPages: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
      url: `${BASE_URL}/listing/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...listingPages];
  } catch {
    return staticPages;
  }
}
