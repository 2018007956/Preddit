/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    domains: [
      "www.gravatar.com", 
      "localhost",
      "preddit-on.vercel.app",
      "ec2-13-124-135-251.ap-northeast-2.compute.amazonaws.com"
    ]
  }
};

export default nextConfig;