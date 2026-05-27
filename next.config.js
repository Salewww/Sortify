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
    ignoreBuildErrors: true,
  },
  distDir: process.env.NEXT_DIST_DIR || '.next',
  env: {
    APP_VERSION: process.env.PORT === '8005' ? 'v2' : 'v1',
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
