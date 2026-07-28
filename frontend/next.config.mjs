/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone keeps EasyPanel runner small and shortens the post-build trace step.
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    cpus: 1,
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu/**',
        'node_modules/@swc/core-linux-x64-musl/**',
        'node_modules/@esbuild/linux-x64/**',
        'node_modules/webpack/**',
      ],
    },
  },
};

export default nextConfig;
