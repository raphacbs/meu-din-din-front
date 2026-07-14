import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/extract",
        destination: "/meu-mes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
