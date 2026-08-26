/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    // Bake the backend URL directly at build time so it works without env vars
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://socailmdeia-downlaoder.onrender.com',
  },
};

export default nextConfig;
