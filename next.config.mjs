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
    unoptimized: true,
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
  // Updated: moved from experimental to top level
  serverExternalPackages: ['jsonwebtoken'],
}

export default nextConfig



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async headers() {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           {
//             key: "Content-Security-Policy",
//             value: "default-src 'self'; img-src 'self' data: blob: https:;",
//           },
//         ],
//       },
//     ]
//   },
//   api: {
//     bodyParser: false,
//     responseLimit: false, 
//   },
//   images: {
//     domains: ['localhost', 'huotsopheaksakana.site/'],
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   env: {
//     JWT_SECRET: process.env.JWT_SECRET,
//   },
//   experimental: {
//     serverComponentsExternalPackages: ['jsonwebtoken'],
//   },

// }

// export default nextConfig
