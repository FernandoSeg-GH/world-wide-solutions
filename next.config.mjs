/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "vinci-space-nest.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
