/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.toon$/,
      type: "asset/source",
    })
    return config
  },
}

export default nextConfig
