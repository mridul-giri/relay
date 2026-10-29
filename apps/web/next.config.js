/** @type {import('next').NextConfig} */

const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:3001";

const nextConfig = {
  transpilePackages: ["@repo/ui"],
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/:path*` }];
  },
};

export default nextConfig;
