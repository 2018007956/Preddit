/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: [
      "www.gravatar.com", 
      "localhost",
      "preddit-on.vercel.app"
    ]
  }
};

export default nextConfig;