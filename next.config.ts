import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'intranet-nextjs-dev.escalante.com.mx',
    'https://intranet-nextjs-dev.escalante.com.mx',
  ],
};

export default nextConfig;
