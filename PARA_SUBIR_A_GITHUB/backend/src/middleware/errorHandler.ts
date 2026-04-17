import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    if (err.name === 'ZodError') {
        const zodErrors = (err as any).errors;
        const firstError = zodErrors?.[0];
        const msg = firstError?.message || 'Datos de entrada inválidos';
        const field = firstError?.path?.join('.') || '';
        res.status(400).json({
            error: field ? `${msg} (campo: ${field})` : msg,
            details: zodErrors
        });
        return;
    }

    res.status(500).json({ error: 'Error interno del servidor' });
};
