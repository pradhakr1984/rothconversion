/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no need for experimental flag
  output: 'standalone',
  distDir: '.next',
}

module.exports = nextConfig 