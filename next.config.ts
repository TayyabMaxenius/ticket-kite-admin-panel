import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'ticketkite.com',
				pathname: '/**', // Match all paths
			},
		],
		formats: ['image/avif', 'image/webp'],
	},
};

export default nextConfig;
