import { siteUrl } from "@/lib/site";

export default function robots() {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/checkout",
          "/cart",
          "/wishlist",
          "/api",
          "/auth",
          "/newsletter",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
