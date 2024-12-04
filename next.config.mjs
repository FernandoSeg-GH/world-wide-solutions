/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "vinci-space-nest.nyc3.digitaloceanspaces.com",
      },
      {
        hostname: "vinci-space-nest.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
