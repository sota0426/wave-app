/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // GitHub Pagesでは画像最適化が不要
  },
};

export default nextConfig;
