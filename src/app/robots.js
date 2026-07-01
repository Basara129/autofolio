export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/warna/", "/checkout"],
    },
    sitemap: "https://autofolio.my.id/sitemap.xml",
  };
}
