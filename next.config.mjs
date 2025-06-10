/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
  },
eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      })
    }
    return config
  },
}

export default nextConfig


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['localhost', 'huotsopheaksakana.site'],
//     unoptimized: false,
//   },

//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   typescript: {
//     ignoreBuildErrors: true,
//   },

//   env: {
//     JWT_SECRET: process.env.JWT_SECRET,
//   },

//   webpack: (config) => {
//     config.cache = false;

//     config.module.rules.push({
//       test: /\.(js|ts|jsx|tsx)$/,
//       exclude: [
//         /node_modules/,
//         /C:\\Users\\.*\\Application Data/,
//       ],
//     });

//     return config;
//   },

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
//     ];
//   },
// };

// export default nextConfig;





// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   staticPageGenerationTimeout: 120,
//   webpack: (config) => {
//     config.cache = false;
//     return config;
//   },
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
//   images: {
//     domains: ['localhost', 'huotsopheaksakana.site'],
//     unoptimized: false,
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   env: {
//     JWT_SECRET: process.env.JWT_SECRET,
//   },
//   serverExternalPackages: ['jsonwebtoken'],
// }

// export default nextConfig

