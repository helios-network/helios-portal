import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "http",
        hostname: "testnet1.helioschainlabs.org",
        port: "8547"
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com"
      },
      {
        protocol: "https",
        hostname: "testnet1-cdn.helioschainlabs.org"
      }
    ]
  }
}

export default nextConfig
