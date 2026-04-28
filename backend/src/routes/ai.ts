import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Models in priority order — falls back if primary is overloaded
const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'];

async function generateWithRetry(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) throw new AppError('API key de IA no configurada. Agrega GEMINI_API_KEY en el .env', 503);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    let lastErr: any;
    for (const modelName of MODELS) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (err: any) {
                lastErr = err;
                const status: number = err?.status ?? 0;
                // 404 = model not available for this key → try next model
                if (status === 404) break;
                // 429/503 = rate limit or overload → wait and retry once, then next model
                if ((status === 429 || status === 503) && attempt === 0) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                // Any other error → skip to next model
                break;
            }
        }
    }

    const status: number = lastErr?.status ?? 0;
    const msg: string = lastErr?.message ?? '';
    console.error('[AI] All models failed. Last error:', status, msg.slice(0, 150));
    if (status === 429) throw new AppError('Límite de solicitudes de IA alcanzado. Espera unos segundos e intenta de nuevo.', 429);
    if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) throw new AppError('Sin conexión a internet desde el servidor.', 503);
    throw new AppError('El servicio de IA no está disponible temporalmente. Intenta en unos minutos.', 503);
}

// ── POST /ai/analyze ──────────────────────────────────────────────────────────
const analyzeSchema = z.object({
    situation: z.string().min(20).max(3000),
    legalArea: z.string().optional(),
    country: z.string().default('Venezuela'),
});

router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
    const { situation, legalArea, country } = analyzeSchema.parse(req.body);

    const prompt = `Eres un asistente legal especializado en derecho venezolano.
Analiza la siguiente situación legal y responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional:
{
  "areaLegal": "PENAL|CIVIL|LOPNA|CORPORATIVO|LABORAL|ADMINISTRATIVO|OTRO",
  "gravedad": "ALTA|MEDIA|BAJA",
  "resumen": "Resumen claro del problema en 2-3 oraciones",
  "derechosAfectados": ["derecho 1", "derecho 2"],
  "estrategias": ["estrategia 1", "estrategia 2", "estrategia 3"],
  "proximosPasos": ["paso 1", "paso 2", "paso 3"],
  "advertencia": "Texto recordando que esto es orientación general y no reemplaza asesoría legal profesional"
}

País: ${country}${legalArea ? `\nÁrea indicada: ${legalArea}` : ''}
Situación: ${situation}`;

    const text = await generateWithRetry(prompt);

    let analysis;
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
        throw new AppError('La IA devolvió una respuesta inesperada. Intenta reformular tu consulta.', 500);
    }

    res.json({ analysis });
}));

// ── POST /ai/generate-document ────────────────────────────────────────────────
const generateSchema = z.object({
    type: z.enum(['PODER_NOTARIAL', 'CONTRATO_SERVICIOS', 'CARTA_RECLAMO', 'DENUNCIA', 'ACUERDO_CONFIDENCIALIDAD', 'SOLICITUD_ADMINISTRATIVA']),
    parties: z.record(z.string()),
    details: z.string().max(2000),
    country: z.string().default('Venezuela'),
});

const DOC_NAMES: Record<string, string> = {
    PODER_NOTARIAL: 'Poder Notarial',
    CONTRATO_SERVICIOS: 'Contrato de Prestación de Servicios',
    CARTA_RECLAMO: 'Carta de Reclamo',
    DENUNCIA: 'Escrito de Denuncia',
    ACUERDO_CONFIDENCIALIDAD: 'Acuerdo de Confidencialidad (NDA)',
    SOLICITUD_ADMINISTRATIVA: 'Solicitud Administrativa',
};

router.post('/generate-document', asyncHandler(async (req: Request, res: Response) => {
    const { type, parties, details, country } = generateSchema.parse(req.body);

    const partiesText = Object.entries(parties)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

    const prompt = `Eres un abogado redactor especializado en derecho venezolano.
Redacta un(a) ${DOC_NAMES[type]} completo para ${country}.
Usa terminología legal venezolana formal. Incluye todos los elementos formales, espacios para firmas y fecha.
Responde SOLO con el texto del documento, sin explicaciones adicionales.

Partes involucradas:
${partiesText}

Detalles adicionales:
${details || 'Ninguno'}`;

    const content = await generateWithRetry(prompt);
    res.json({ document: content, type, typeName: DOC_NAMES[type] });
}));

export default router;
