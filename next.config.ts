import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
