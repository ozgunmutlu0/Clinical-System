/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.canva.com"
      }
    ]
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || "http://backend:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
