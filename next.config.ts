/** @type {import('next').NextConfig} */

const nextConfig = {
  turbopack: { root: __dirname }, // silence the warning & load the right env files
  devIndicators: false,
};
module.exports = nextConfig;
