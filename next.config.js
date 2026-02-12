/** @type {import('next').NextConfig} */
const nextConfig = {
  // Évite les problèmes de résolution sur Vercel
  reactStrictMode: true,
  // Pas de basePath pour que / soit bien servi
  basePath: undefined,
  assetPrefix: undefined,
};

module.exports = nextConfig;
