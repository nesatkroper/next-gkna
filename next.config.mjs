/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' data: blob: https:;",
          },
        ],
      },
    ]
  },
  images: {
    domains: ['localhost', 'huotsopheaksakana.site'],
    unoptimized: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  serverExternalPackages: ['jsonwebtoken'],
}

export default nextConfig

