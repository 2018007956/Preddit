/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: [
      "www.gravatar.com", 
      process.env.PUBLIC_URL
    ]
  }
};

export default nextConfig;