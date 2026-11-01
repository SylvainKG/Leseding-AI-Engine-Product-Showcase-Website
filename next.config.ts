import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets `npm run dev` work when opened by network address (e.g. another device
  // on the same Wi-Fi, or http://192.168.x.x:3000 on this machine). Without it,
  // Next.js blocks its dev scripts/HMR for that address and the page never
  // becomes interactive. Dev server only; has no effect on the deployed site.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.20.10.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
