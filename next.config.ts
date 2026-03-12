import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core", "playwright"],
  outputFileTracingIncludes: {
    "/api/free/convert/route": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/@sparticuz/chromium/build/**/*"
    ]
  }
};

export default nextConfig;
