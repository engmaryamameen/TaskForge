import path from 'path';
import { fileURLToPath } from 'url';
import type { NextConfig } from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// API: use NEXT_PUBLIC_API_URL in the client (src/lib/api/client.ts). External rewrites need `https://`.
// Pin tracing to this app so Vercel/monorepo builds do not pick a parent lockfile as the workspace root.
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
