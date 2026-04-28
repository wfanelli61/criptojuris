import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Helper to safely read env vars (trim whitespace/newlines)
const env = (key: string, fallback: string): string => (process.env[key] || fallback).trim();

const nodeEnv = env('NODE_ENV', 'development');
const jwtSecret = env('JWT_SECRET', 'dev-secret-change-me');
const jwtRefreshSecret = env('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me');

// En producción, fallar si se usan los secrets por defecto
if (nodeEnv === 'production') {
    if (jwtSecret === 'dev-secret-change-me') throw new Error('JWT_SECRET no puede ser el valor por defecto en producción');
    if (jwtRefreshSecret === 'dev-refresh-secret-change-me') throw new Error('JWT_REFRESH_SECRET no puede ser el valor por defecto en producción');
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
