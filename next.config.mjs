/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  "devIndicators": false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mygrocery-bucket.s3.us-east-2.amazonaws.com",
        pathname: "/**", // sare images allow honge bucket ke andar
      },
    ],
  },
  experimental: {
    scrollRestoration: false,
  },
};

export default nextConfig;
