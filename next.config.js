/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",

  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  basePath: isProd ? "/nezeal-shintal-wedding1" : "",
  assetPrefix: isProd ? "/nezeal-shintal-wedding1/" : "",
};

export default nextConfig;
