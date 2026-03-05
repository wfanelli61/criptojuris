import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgresql://abogados_user:abogados_pass@localhost:5432/abogados_db',
    },
};
