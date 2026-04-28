import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// POST /api/ai/analizar-caso
// Analiza la situación legal descrita por el usuario y devuelve un JSON estructurado
router.post('/analizar-caso', asyncHandler(async (req: Request, res: Response) => {
    const { descripcion, area } = req.body;

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 20) {
        throw new AppError('Debes proporcionar una descripción detallada de al menos 20 caracteres', 400);
    }

    const prompt = `Eres un asistente legal especializado en derecho venezolano. Analiza la siguiente situación legal y responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin bloques de código).

Situación: ${descripcion.trim()}
${area ? `Área legal indicada: ${area}` : ''}

El JSON debe tener exactamente esta estructura:
{
  "areaLegal": "string (ej: Derecho Laboral, Derecho Civil, Derecho Penal, Derecho Familiar, etc.)",
  "gravedad": "string (BAJA | MEDIA | ALTA | CRITICA)",
  "resumen": "string (resumen del caso en 2-3 oraciones)",
  "derechos": ["string", "string", "string"],
  "riesgos": ["string", "string"],
  "estrategias": ["string", "string", "string"],
  "pasosInmediatos": ["string", "string", "string"],
  "tiempoEstimado": "string (estimación del proceso legal)",
  "recomendacion": "string (recomendación principal)"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let analysis: Record<string, unknown>;
    try {
        // Strip markdown code fences if present
        const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        analysis = JSON.parse(clean);
    } catch {
        throw new AppError('Error al procesar la respuesta de IA. Intenta de nuevo.', 500);
    }

    res.json({ analysis });
}));

// POST /api/ai/generar-reporte
// Genera un reporte formal de una consulta/cita dado su ID
router.post('/generar-reporte', asyncHandler(async (req: Request, res: Response) => {
    const { appointmentId, notasAdicionales } = req.body;

    if (!appointmentId) {
        throw new AppError('Se requiere el ID de la consulta', 400);
    }

    const appointment = await prisma.appointmentRequest.findFirst({
        where: {
            id: appointmentId,
            ...(req.user!.role === 'CLIENTE' ? { clientId: req.user!.userId } : {}),
            ...(req.user!.role === 'ABOGADO' ? { lawyerId: req.user!.userId } : {}),
        },
        include: {
            client: { select: { name: true, email: true, phone: true } },
            lawyer: {
                select: {
                    name: true,
                    lawyerProfile: { select: { specialties: true, yearsExperience: true, city: true } },
                },
            },
            service: { select: { name: true, description: true, price: true } },
        },
    });

    if (!appointment) {
        throw new AppError('Consulta no encontrada o sin acceso', 404);
    }

    const lawyerSpecialties = appointment.lawyer?.lawyerProfile?.specialties
        ? JSON.parse(appointment.lawyer.lawyerProfile.specialties as string)
        : [];

    const prompt = `Eres un asistente legal profesional. Genera un reporte formal de consulta legal en español, siguiendo las convenciones del sistema jurídico venezolano.

DATOS DE LA CONSULTA:
- Cliente: ${appointment.client.name} (${appointment.client.email})
- Abogado: ${appointment.lawyer?.name ?? 'Por asignar'}
- Especialidades: ${lawyerSpecialties.join(', ') || 'No especificadas'}
- Servicio solicitado: ${appointment.service.name}
- Descripción del servicio: ${appointment.service.description}
- Fecha preferida: ${appointment.preferredDate ? new Date(appointment.preferredDate).toLocaleDateString('es-VE') : 'No especificada'}
- Estado: ${appointment.status}
- Mensaje del cliente: ${appointment.message || 'Sin descripción adicional'}
${notasAdicionales ? `- Notas adicionales: ${notasAdicionales}` : ''}

Genera un reporte profesional con las siguientes secciones:
1. ENCABEZADO (fecha actual, número de expediente ficticio)
2. DATOS DEL CLIENTE
3. DATOS DEL PROFESIONAL ASIGNADO
4. DESCRIPCIÓN DEL CASO
5. ANÁLISIS PRELIMINAR
6. ACCIONES RECOMENDADAS
7. OBSERVACIONES
8. FIRMA Y FECHA

El reporte debe ser formal, profesional y detallado. Usa lenguaje jurídico apropiado.`;

    const result = await model.generateContent(prompt);
    const reporte = result.response.text().trim();

    res.json({ reporte, appointment: { id: appointment.id, status: appointment.status } });
}));

// POST /api/ai/consulta-rapida
// Responde preguntas legales generales sin necesidad de un caso específico
router.post('/consulta-rapida', asyncHandler(async (req: Request, res: Response) => {
    const { pregunta } = req.body;

    if (!pregunta || typeof pregunta !== 'string' || pregunta.trim().length < 10) {
        throw new AppError('Debes proporcionar una pregunta de al menos 10 caracteres', 400);
    }

    const prompt = `Eres un asistente legal especializado en derecho venezolano. Responde la siguiente pregunta legal de forma clara, precisa y profesional. Si la pregunta requiere asesoría personalizada, indícalo y recomienda consultar con un abogado del sistema.

Pregunta: ${pregunta.trim()}

Responde de forma estructurada con:
- Respuesta directa a la pregunta
- Marco legal aplicable (leyes venezolanas relevantes)
- Recomendaciones prácticas
- Si necesita consulta profesional: indicarlo claramente`;

    const result = await model.generateContent(prompt);
    const respuesta = result.response.text().trim();

    res.json({ respuesta });
}));

export default router;
