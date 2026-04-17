import type { NextConfig } from "next";

// In production, use the Render backend URL; locally use localhost:4000
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
    : 'http://localhost:4000';

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${BACKEND_URL}/api/:path*`,
            },
            {
                source: "/uploads/:path*",
                destination: `${BACKEND_URL}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
