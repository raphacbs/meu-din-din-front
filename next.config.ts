import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        output: 'export', // Diz ao Next.js para gerar arquivos estáticos puros
        source: "/extract",
        destination: "/meu-mes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
