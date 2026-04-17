import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Helper to safely read env vars (trim whitespace/newlines)
const env = (key: string, fallback: string): string => (process.env[key] || fallback).trim();

export const config = {
    port: parseInt(env('PORT', '4000'), 10),
    nodeEnv: env('NODE_ENV', 'development'),
    // Support multiple origins separated by commas
    corsOrigin: env('CORS_ORIGIN', 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0),
    jwt: {
        secret: env('JWT_SECRET', 'dev-secret-change-me'),
        refreshSecret: env('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
        expiresIn: env('JWT_EXPIRES_IN', '15m'),
        refreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
    database: {
        url: env('DATABASE_URL', 'postgresql://abogados_user:abogados_pass@localhost:5432/abogados_db'),
    },
};
