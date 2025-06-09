/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
