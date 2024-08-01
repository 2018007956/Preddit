/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: [
      "www.gravatar.com", 
      "localhost",
      "https://preddit.loca.lt"
    ]
  }
};

export default nextConfig;