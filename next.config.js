import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  env: {
    APP_VERSION: process.env.PORT === '3007' ? 'v2' : 'v1',
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
