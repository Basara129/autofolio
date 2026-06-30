/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },{
        protocol: "https",
        hostname: "ovcatigbqltxmltnshlw.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
