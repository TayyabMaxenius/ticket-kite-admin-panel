import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ticketkite.com",
				pathname: "/**", // Match all paths
			},
			{
				protocol: "https",
				hostname: "ticketkite-images.s3.eu-west-2.amazonaws.com",
				pathname: "/**", // Match all paths
			},
		],
		formats: ["image/avif", "image/webp"],
	},
};

export default nextConfig;
