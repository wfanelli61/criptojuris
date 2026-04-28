import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const prisma = new PrismaClient();

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

// ── POST /ai/assistant ───────────────────────────────────────────────────────
// IA con acceso a la BD del usuario — responde preguntas con datos reales
const assistantSchema = z.object({
    message: z.string().min(1).max(1000),
});

router.post('/assistant', asyncHandler(async (req: Request, res: Response) => {
    const { message } = assistantSchema.parse(req.body);
    const { userId, role } = req.user!;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 86400000);
    const weekEnd    = new Date(todayStart.getTime() + 7 * 86400000);

    let context = '';

    if (role === 'ABOGADO') {
        const [cases, todayCitas, weekCitas, pendingBudgets] = await Promise.all([
            prisma.legalCase.findMany({
                where: { lawyerId: userId },
                include: { client: { select: { name: true } } },
                orderBy: { updatedAt: 'desc' },
                take: 20,
            }),
            prisma.appointmentRequest.findMany({
                where: { lawyerId: userId, preferredDate: { gte: todayStart, lt: todayEnd } },
                include: { client: { select: { name: true } }, service: { select: { name: true } } },
                orderBy: { preferredDate: 'asc' },
            }),
            prisma.appointmentRequest.findMany({
                where: { lawyerId: userId, preferredDate: { gte: todayStart, lt: weekEnd }, status: { not: 'CANCELADA' } },
                include: { client: { select: { name: true } }, service: { select: { name: true } } },
                orderBy: { preferredDate: 'asc' },
            }),
            prisma.legalCase.findMany({
                where: { lawyerId: userId, status: 'PRESUPUESTO_APROBADO' },
                include: { client: { select: { name: true } } },
            }),
        ]);

        const casesByStatus = cases.reduce((acc: Record<string, number>, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});

        context = `ROL: Abogado
FECHA HOY: ${today.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}

CITAS DE HOY (${todayCitas.length}):
${todayCitas.length === 0 ? 'Sin citas para hoy.' : todayCitas.map(c =>
    `- ${c.preferredDate ? new Date(c.preferredDate).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : 'Sin hora'} | Cliente: ${c.client.name} | Servicio: ${c.service.name} | Estado: ${c.status}`
).join('\n')}

CITAS ESTA SEMANA (${weekCitas.length}):
${weekCitas.length === 0 ? 'Sin citas esta semana.' : weekCitas.map(c =>
    `- ${c.preferredDate ? new Date(c.preferredDate).toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric' }) : 'Sin fecha'} | ${c.client.name} | ${c.service.name}`
).join('\n')}

MIS CASOS (${cases.length} total):
${Object.entries(casesByStatus).map(([s, n]) => `- ${s}: ${n}`).join('\n')}

CASOS ACTIVOS RECIENTES:
${cases.filter(c => !['CERRADO','CANCELADO'].includes(c.status)).slice(0, 8).map(c =>
    `- "${c.title}" | Cliente: ${c.client.name} | Área: ${c.legalArea} | Estado: ${c.status}`
).join('\n')}

PRESUPUESTOS APROBADOS PENDIENTES DE CONTRATO (${pendingBudgets.length}):
${pendingBudgets.map(c => `- "${c.title}" | ${c.client.name}`).join('\n') || 'Ninguno'}`;

    } else if (role === 'ADMIN') {
        const [totalUsers, totalCases, todayCitas, weekCitas, recentCases, casesByArea] = await Promise.all([
            prisma.user.groupBy({ by: ['role'], _count: true }),
            prisma.legalCase.groupBy({ by: ['status'], _count: true }),
            prisma.appointmentRequest.findMany({
                where: { preferredDate: { gte: todayStart, lt: todayEnd } },
                include: { client: { select: { name: true } }, lawyer: { select: { name: true } }, service: { select: { name: true } } },
                orderBy: { preferredDate: 'asc' },
            }),
            prisma.appointmentRequest.findMany({
                where: { preferredDate: { gte: todayStart, lt: weekEnd }, status: { not: 'CANCELADA' } },
                include: { client: { select: { name: true } }, lawyer: { select: { name: true } } },
            }),
            prisma.legalCase.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
                include: { client: { select: { name: true } }, lawyer: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }, take: 10,
            }),
            prisma.legalCase.groupBy({ by: ['legalArea'], _count: true, orderBy: { _count: { legalArea: 'desc' } } }),
        ]);

        context = `ROL: Administrador del Bufete
FECHA HOY: ${today.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}

USUARIOS DEL SISTEMA:
${totalUsers.map((u: any) => `- ${u.role}: ${u._count}`).join('\n')}

CASOS POR ESTADO:
${totalCases.map((c: any) => `- ${c.status}: ${c._count}`).join('\n')}

ÁREAS MÁS ACTIVAS:
${casesByArea.map((a: any) => `- ${a.legalArea}: ${a._count} casos`).join('\n')}

CITAS DE HOY (${todayCitas.length}):
${todayCitas.length === 0 ? 'Sin citas para hoy.' : todayCitas.map(c =>
    `- ${c.preferredDate ? new Date(c.preferredDate).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : 'Sin hora'} | ${c.client.name} con ${c.lawyer?.name || 'Sin asignar'} | ${c.service.name}`
).join('\n')}

CITAS ESTA SEMANA: ${weekCitas.length}

CASOS NUEVOS ESTA SEMANA (${recentCases.length}):
${recentCases.map(c =>
    `- "${c.title}" | Cliente: ${c.client.name} | Abogado: ${c.lawyer?.name || 'Sin asignar'} | Área: ${c.legalArea}`
).join('\n') || 'Ninguno'}`;

    } else {
        // CLIENTE
        const [myCases, myCitas] = await Promise.all([
            prisma.legalCase.findMany({
                where: { clientId: userId },
                include: { lawyer: { select: { name: true } } },
                orderBy: { updatedAt: 'desc' }, take: 10,
            }),
            prisma.appointmentRequest.findMany({
                where: { clientId: userId, preferredDate: { gte: todayStart } },
                include: { lawyer: { select: { name: true } }, service: { select: { name: true } } },
                orderBy: { preferredDate: 'asc' }, take: 5,
            }),
        ]);

        context = `ROL: Cliente
FECHA HOY: ${today.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}

MIS CASOS (${myCases.length}):
${myCases.map(c =>
    `- "${c.title}" | Área: ${c.legalArea} | Estado: ${c.status} | Abogado: ${c.lawyer?.name || 'Sin asignar'}`
).join('\n') || 'Sin casos registrados.'}

PRÓXIMAS CITAS:
${myCitas.map(c =>
    `- ${c.preferredDate ? new Date(c.preferredDate).toLocaleDateString('es-VE') : 'Sin fecha'} | ${c.service.name} | Abogado: ${c.lawyer?.name || 'Sin asignar'} | Estado: ${c.status}`
).join('\n') || 'Sin citas próximas.'}`;
    }

    const prompt = `Eres el asistente de inteligencia artificial de BufeteLegal, un bufete de abogados venezolano.
Tienes acceso a los datos reales del sistema. Responde de forma clara, directa y en español.
No inventes información — usa SOLO los datos que se te dan. Si no hay datos, dilo claramente.
Sé conciso pero completo. Usa un tono profesional y amigable.

=== DATOS REALES DEL SISTEMA ===
${context}

=== PREGUNTA DEL USUARIO ===
${message}`;

    const response = await generateWithRetry(prompt);
    res.json({ response });
}));

export default router;
