import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
    : 'http://localhost:4000';

const nextConfig: NextConfig = {
    // Compresión de respuestas
    compress: true,

    // Optimización de imágenes
    images: {
        remotePatterns: [
            { protocol: 'http',  hostname: 'localhost',      port: '4000', pathname: '/uploads/**' },
            { protocol: 'https', hostname: '*.bufetelegal.com', pathname: '/uploads/**' },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 3600,
    },

    // Headers de seguridad y cache
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options',    value: 'nosniff' },
                    { key: 'X-Frame-Options',           value: 'DENY' },
                    { key: 'X-XSS-Protection',          value: '1; mode=block' },
                    { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
                ],
            },
            // Cache estático para assets
            {
                source: '/(_next/static|favicon|og-image)(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
        ];
    },

    // Rewrites al backend
    async rewrites() {
        return [
            { source: '/api/:path*',     destination: `${BACKEND_URL}/api/:path*` },
            { source: '/uploads/:path*', destination: `${BACKEND_URL}/uploads/:path*` },
        ];
    },

    // Optimizaciones de compilación
    experimental: {
        optimizePackageImports: ['react', 'react-dom'],
    },
};

export default nextConfig;
