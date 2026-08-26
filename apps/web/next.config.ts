import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    return {
      beforeFiles: [
        // single.html = page d'accueil principale du projet
        { source: "/", destination: "/single.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s1.cdn.autoevolution.com" },
      { protocol: "https", hostname: "api.auto24.ma" },
      { protocol: "https", hostname: "auto24.ma" },
      { protocol: "https", hostname: "www.avito.ma" },
      { protocol: "https", hostname: "img.avito.ma" },
      { protocol: "https", hostname: "www.moteur.ma" },
      { protocol: "https", hostname: "www.wandaloo.com" },
      { protocol: "https", hostname: "www.kifal.ma" },
      { protocol: "https", hostname: "www.spoticar.ma" },
      { protocol: "https", hostname: "www.autocaz.ma" },
      { protocol: "https", hostname: "www.soeezauto.ma" },
      { protocol: "https", hostname: "ovoiture.ma" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "www.marocannonces.com" },
      { protocol: "https", hostname: "www.kijiji.ma" },
      { protocol: "https", hostname: "voiture.ma" },
      { protocol: "https", hostname: "www.siaracash.com" },
      { protocol: "https", hostname: "cdn.imagin.studio" },
    ],
  },
};

export default nextConfig;
