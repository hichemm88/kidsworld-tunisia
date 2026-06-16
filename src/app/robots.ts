import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/profil"],
      },
    ],
    sitemap: "https://kidsworld-tunisia.vercel.app/sitemap.xml",
  };
}
