/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mygrocery-bucket.s3.us-east-2.amazonaws.com",
        pathname: "/**", // sare images allow honge bucket ke andar
      },
    ],
  },
};

export default nextConfig;
