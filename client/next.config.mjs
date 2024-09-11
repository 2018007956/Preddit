/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: [
      "www.gravatar.com", 
      "localhost",
      //public-domain
    ]
  }
};

export default nextConfig;