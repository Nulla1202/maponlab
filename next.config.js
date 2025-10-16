/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Leafletはクライアントサイドのみで動作
  transpilePackages: ['leaflet', 'react-leaflet'],
}

module.exports = nextConfig
