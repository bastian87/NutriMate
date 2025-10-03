/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  webpack: (config, { isServer }) => {
    // Fix for WebAssembly hashing issue in Next.js 14.2.16
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
}

export default nextConfig