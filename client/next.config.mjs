/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: [
      "www.gravatar.com", 
      "localhost",
      "https://production-url"
    ]
  }
};

export default nextConfig;