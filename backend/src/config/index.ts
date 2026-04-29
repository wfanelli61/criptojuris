import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = (key: string, fallback = ''): string => (process.env[key] || fallback).trim();

const nodeEnv = env('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

const jwtSecret = env('JWT_SECRET', 'dev-secret-change-me-32chars-min!!');
const jwtRefreshSecret = env('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me-32!!');

// En producción exigir secrets reales de longitud suficiente
if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
        throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32)
        throw new Error('JWT_REFRESH_SECRET debe tener al menos 32 caracteres en producción');
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql'))
        throw new Error('DATABASE_URL debe ser una URL PostgreSQL válida en producción');
}

export const config = {
    port: parseInt(env('PORT', '4000'), 10),
    nodeEnv,
    corsOrigin: env('CORS_ORIGIN', 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0),
    jwt: {
        secret: jwtSecret,
        refreshSecret: jwtRefreshSecret,
        expiresIn: env('JWT_EXPIRES_IN', '15m'),
        refreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
    database: {
        url: env('DATABASE_URL', 'file:./dev.db'),
    },
};
