import { qs } from '../validators';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { AppError } from '../middleware/errorHandler';
import { notify, removeNotifications } from '../utils/notify';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);

// ─── UTILIDAD ────────────────────────────────────────────────────────────────

function generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `EXP-${year}-${random}`;
}

const caseInclude = {
    client: { select: { id: true, name: true, email: true, phone: true } },
    lawyer: { select: { id: true, name: true, email: true, lawyerProfile: { select: { photoUrl: true, specialties: true } } } },
    budget: true,
    contract: true,
    analysis: true,
    documents: { orderBy: { createdAt: 'desc' as const } },
    investigations: { orderBy: { date: 'desc' as const } },
    norms: { include: { legalNorm: true } },
};

// ─── CASOS ───────────────────────────────────────────────────────────────────

// POST /cases — cliente crea solicitud de caso
router.post('/', requireRole('CLIENTE'), asyncHandler(async (req: Request, res: Response) => {
    const { title, description, legalArea, lawyerId } = req.body;
    if (!title || !legalArea) throw new AppError('Título y área jurídica son requeridos', 400);

    const validAreas = ['PENAL', 'CIVIL', 'LOPNA', 'CORPORATIVO'];
    if (!validAreas.includes(legalArea)) throw new AppError('Área jurídica inválida', 400);

    let caseNumber = generateCaseNumber();
    while (await prisma.legalCase.findUnique({ where: { caseNumber } })) {
        caseNumber = generateCaseNumber();
    }

    const newCase = await prisma.legalCase.create({
        data: { caseNumber, title, description, legalArea, clientId: req.user!.userId, lawyerId: lawyerId || null },
        include: caseInclude,
    });

    // Notificar a todos los abogados aprobados de esa área jurídica
    const lawyers = await prisma.user.findMany({
        where: {
            role: 'ABOGADO',
            deletedAt: null,
            lawyerProfile: { verificationStatus: 'APPROVED' },
        },
        select: { id: true },
    });
    await Promise.all(lawyers.map(l => notify(l.id, {
        title: 'Nueva solicitud de caso',
        body: `Nuevo caso ${legalArea}: "${title}". Podés tomarlo desde Expedientes.`,
        type: 'CASO',
        link: '/dashboard/casos',
        refId: newCase.id,
    })));

    res.status(201).json({ case: newCase });
}));

// GET /cases — lista según rol
// Para abogados: ?view=unassigned muestra casos sin abogado (solicitudes nuevas)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const { role, userId } = req.user!;
    const { status, legalArea, view, page = '1', limit = '10' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (role === 'CLIENTE') {
        where.clientId = userId;
    } else if (role === 'ABOGADO') {
        if (view === 'unassigned') {
            where.lawyerId = null;
            where.status = 'SOLICITUD';
        } else {
            where.lawyerId = userId;
        }
    }
    // ADMIN ve todos

    if (status && view !== 'unassigned') where.status = status;
    if (legalArea) where.legalArea = legalArea;

    const [total, cases] = await Promise.all([
        prisma.legalCase.count({ where }),
        prisma.legalCase.findMany({
            where,
            include: {
                client: { select: { id: true, name: true, email: true } },
                lawyer: { select: { id: true, name: true, lawyerProfile: { select: { photoUrl: true } } } },
                budget: { select: { status: true, amount: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        }),
    ]);

    res.json({ cases, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

// GET /cases/:id — detalle completo
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { role, userId } = req.user!;
    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id }, include: caseInclude });
    if (!found) throw new AppError('Caso no encontrado', 404);

    if (role === 'CLIENTE' && found.clientId !== userId) throw new AppError('Sin acceso', 403);
    if (role === 'ABOGADO' && found.lawyerId !== userId) throw new AppError('Sin acceso', 403);

    res.json({ case: found });
}));

// PATCH /cases/:id/status — abogado o admin cambia estado
router.patch('/:id/status', requireRole('ABOGADO', 'ADMIN'), asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const validStatuses = ['SOLICITUD', 'PRESUPUESTO_ENVIADO', 'PRESUPUESTO_APROBADO', 'CONTRATO_FIRMADO', 'EN_CURSO', 'CERRADO', 'CANCELADO'];
    if (!validStatuses.includes(status)) throw new AppError('Estado inválido', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (req.user!.role === 'ABOGADO' && found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const STATUS_LABEL: Record<string, string> = {
        SOLICITUD: 'Solicitud', PRESUPUESTO_ENVIADO: 'Presupuesto enviado',
        PRESUPUESTO_APROBADO: 'Presupuesto aprobado', CONTRATO_FIRMADO: 'Contrato firmado',
        EN_CURSO: 'En curso', CERRADO: 'Cerrado', CANCELADO: 'Cancelado',
    };

    const [updated] = await Promise.all([
        prisma.legalCase.update({ where: { id: req.params.id }, data: { status } }),
        (prisma as any).caseEvent.create({ data: {
            caseId: req.params.id,
            userId: req.user!.userId,
            type: 'STATUS_CHANGE',
            description: `Estado cambiado de "${STATUS_LABEL[found.status] || found.status}" a "${STATUS_LABEL[status] || status}"`,
            fromStatus: found.status,
            toStatus: status,
        }}),
    ]);
    res.json({ case: updated });
}));

// PATCH /cases/:id/assign — abogado se asigna a un caso sin abogado
router.patch('/:id/assign', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.lawyerId) throw new AppError('El caso ya tiene abogado asignado', 400);

    const updated = await prisma.legalCase.update({
        where: { id: req.params.id },
        data: { lawyerId: req.user!.userId, status: 'PRESUPUESTO_ENVIADO' },
        include: caseInclude,
    });

    // Borrar la notificación del nuevo caso en TODOS los abogados excepto el que la tomó
    await removeNotifications(found.id, req.user!.userId);

    // Notificar al cliente
    await notify(found.clientId, {
        title: 'Abogado asignado a tu caso',
        body: `Un abogado tomó tu caso "${found.title}". Pronto recibirás un presupuesto.`,
        type: 'CASO',
        link: `/dashboard/mis-casos/${found.id}`,
    });

    res.json({ case: updated });
}));

// ─── PRESUPUESTO ─────────────────────────────────────────────────────────────

// POST /cases/:id/budget — abogado crea presupuesto
router.post('/:id/budget', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { amount, description } = req.body;
    if (!amount || !description) throw new AppError('Monto y descripción son requeridos', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const budget = await prisma.budget.upsert({
        where: { caseId: req.params.id },
        update: { amount: Number(amount), description, status: 'PENDIENTE' },
        create: { caseId: req.params.id, amount: Number(amount), description },
    });

    await prisma.legalCase.update({ where: { id: req.params.id }, data: { status: 'PRESUPUESTO_ENVIADO' } });

    await notify(found.clientId, {
        title: 'Recibiste un presupuesto',
        body: `Tu abogado envió un presupuesto para "${found.title}". Revisalo y respondé.`,
        type: 'PRESUPUESTO',
        link: `/dashboard/mis-casos/${found.id}`,
    });

    res.json({ budget });
}));

// PATCH /cases/:id/budget/respond — cliente aprueba o rechaza
router.patch('/:id/budget/respond', requireRole('CLIENTE'), asyncHandler(async (req: Request, res: Response) => {
    const { approved } = req.body;
    if (approved === undefined) throw new AppError('Campo "approved" requerido', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id }, include: { budget: true } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.clientId !== req.user!.userId) throw new AppError('Sin acceso', 403);
    if (!found.budget) throw new AppError('No hay presupuesto para responder', 404);

    const status = approved ? 'APROBADO' : 'RECHAZADO';
    const [budget] = await Promise.all([
        prisma.budget.update({ where: { caseId: req.params.id }, data: { status } }),
        prisma.legalCase.update({ where: { id: req.params.id }, data: { status: approved ? 'PRESUPUESTO_APROBADO' : 'SOLICITUD' } }),
    ]);

    if (found.lawyerId) {
        await notify(found.lawyerId, {
            title: approved ? 'Presupuesto aprobado' : 'Presupuesto rechazado',
            body: `El cliente ${approved ? 'aprobó' : 'rechazó'} el presupuesto del caso "${found.title}".`,
            type: 'PRESUPUESTO',
            link: `/dashboard/casos/${found.id}`,
        });
    }

    res.json({ budget });
}));

// ─── CONTRATO ────────────────────────────────────────────────────────────────

// POST /cases/:id/contract — abogado crea contrato
router.post('/:id/contract', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { terms, fileUrl } = req.body;
    if (!terms) throw new AppError('Los términos del contrato son requeridos', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const contract = await prisma.serviceContract.upsert({
        where: { caseId: req.params.id },
        update: { terms, fileUrl: fileUrl || null },
        create: { caseId: req.params.id, terms, fileUrl: fileUrl || null },
    });

    await notify(found.clientId, {
        title: 'Contrato listo para firmar',
        body: `Tu abogado envió el contrato del caso "${found.title}". Revisalo y firmalo.`,
        type: 'CONTRATO',
        link: `/dashboard/mis-casos/${found.id}`,
    });

    res.json({ contract });
}));

// PATCH /cases/:id/contract/sign — cliente o abogado firma con trazo digital
router.patch('/:id/contract/sign', asyncHandler(async (req: Request, res: Response) => {
    const { signature } = req.body;
    if (!signature || !signature.startsWith('data:image/png;base64,')) {
        throw new AppError('Firma inválida: se requiere imagen PNG en base64', 400);
    }

    const { role, userId } = req.user!;
    if (role !== 'CLIENTE' && role !== 'ABOGADO') throw new AppError('Sin acceso', 403);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id }, include: { contract: true } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (!found.contract) throw new AppError('No hay contrato disponible', 404);

    if (role === 'CLIENTE' && found.clientId !== userId) throw new AppError('Sin acceso', 403);
    if (role === 'ABOGADO' && found.lawyerId !== userId) throw new AppError('Sin acceso', 403);

    const isClient = role === 'CLIENTE';
    const updateData: any = isClient
        ? { clientSignature: signature, clientSignedAt: new Date() }
        : { lawyerSignature: signature, lawyerSignedAt: new Date() };

    let contract = await prisma.serviceContract.update({
        where: { caseId: req.params.id },
        data: updateData,
    });

    // Cuando ambos firmaron: generar hash e iniciar el caso
    const clientSig = isClient ? signature : contract.clientSignature;
    const lawyerSig = isClient ? contract.lawyerSignature : signature;

    if (clientSig && lawyerSig) {
        const crypto = await import('crypto');
        const hash = crypto.createHash('sha256')
            .update(found.contract.terms + clientSig.slice(-64) + lawyerSig.slice(-64))
            .digest('hex');

        contract = await prisma.serviceContract.update({
            where: { caseId: req.params.id },
            data: { signatureHash: hash, signedAt: new Date(), signedBy: 'AMBOS' },
        });

        await prisma.legalCase.update({ where: { id: req.params.id }, data: { status: 'EN_CURSO' } });

        // Notificar a ambas partes
        await Promise.all([
            notify(found.clientId, {
                title: 'Contrato firmado por ambas partes',
                body: `El caso "${found.title}" está oficialmente en curso.`,
                type: 'CONTRATO',
                link: `/dashboard/mis-casos/${found.id}`,
            }),
            found.lawyerId ? notify(found.lawyerId, {
                title: 'Contrato firmado por ambas partes',
                body: `El caso "${found.title}" está oficialmente en curso.`,
                type: 'CONTRATO',
                link: `/dashboard/casos/${found.id}`,
            }) : Promise.resolve(),
        ]);
    } else {
        // Solo una parte firmó: notificar a la otra
        if (isClient && found.lawyerId) {
            await notify(found.lawyerId, {
                title: 'El cliente firmó el contrato',
                body: `"${found.title}": el cliente firmó. Ahora te toca a vos.`,
                type: 'CONTRATO',
                link: `/dashboard/casos/${found.id}`,
            });
        } else if (!isClient) {
            await notify(found.clientId, {
                title: 'Tu abogado firmó el contrato',
                body: `"${found.title}": tu abogado firmó. Ahora te toca a vos.`,
                type: 'CONTRATO',
                link: `/dashboard/mis-casos/${found.id}`,
            });
        }
    }

    res.json({ contract });
}));

// ─── ANÁLISIS ────────────────────────────────────────────────────────────────

// POST /cases/:id/analysis — abogado crea o actualiza análisis
router.post('/:id/analysis', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { summary, strategy, route, risks } = req.body;
    if (!summary || !strategy || !route) throw new AppError('Resumen, estrategia y ruta son requeridos', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const analysis = await prisma.caseAnalysis.upsert({
        where: { caseId: req.params.id },
        update: { summary, strategy, route, risks: risks || null },
        create: { caseId: req.params.id, summary, strategy, route, risks: risks || null },
    });
    res.json({ analysis });
}));

// ─── DOCUMENTOS / ESCRITOS ───────────────────────────────────────────────────

// POST /cases/:id/documents — abogado sube escrito
router.post('/:id/documents', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { type, title, description, fileUrl, fileName, fileSize, presentedAt } = req.body;
    const validTypes = ['RECURSO', 'AMPARO', 'INCIDENTAL', 'OTRO'];
    if (!type || !validTypes.includes(type)) throw new AppError('Tipo de documento inválido', 400);
    if (!title) throw new AppError('El título es requerido', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const doc = await prisma.caseDocument.create({
        data: {
            caseId: req.params.id, type, title,
            description: description || null,
            fileUrl: fileUrl || null, fileName: fileName || null,
            fileSize: fileSize || null,
            presentedAt: presentedAt ? new Date(presentedAt) : null,
        },
    });
    res.status(201).json({ document: doc });
}));

// DELETE /cases/:id/documents/:docId
router.delete('/:id/documents/:docId', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found || found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    await prisma.caseDocument.delete({ where: { id: req.params.docId } });
    res.json({ message: 'Documento eliminado' });
}));

// ─── DILIGENCIAS ─────────────────────────────────────────────────────────────

// POST /cases/:id/investigations
router.post('/:id/investigations', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const { title, description, result, date } = req.body;
    if (!title || !description || !date) throw new AppError('Título, descripción y fecha son requeridos', 400);

    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found) throw new AppError('Caso no encontrado', 404);
    if (found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    const investigation = await prisma.investigation.create({
        data: { caseId: req.params.id, title, description, result: result || null, date: new Date(date) },
    });
    res.status(201).json({ investigation });
}));

// DELETE /cases/:id/investigations/:invId
router.delete('/:id/investigations/:invId', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found || found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    await prisma.investigation.delete({ where: { id: req.params.invId } });
    res.json({ message: 'Diligencia eliminada' });
}));

// ─── NORMAS VINCULADAS ───────────────────────────────────────────────────────

// POST /cases/:id/norms/:normId — vincular norma al caso
router.post('/:id/norms/:normId', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found || found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    await prisma.caseNorm.upsert({
        where: { caseId_legalNormId: { caseId: req.params.id, legalNormId: req.params.normId } },
        update: {},
        create: { caseId: req.params.id, legalNormId: req.params.normId },
    });
    res.json({ message: 'Norma vinculada al caso' });
}));

// DELETE /cases/:id/norms/:normId
router.delete('/:id/norms/:normId', requireRole('ABOGADO'), asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!found || found.lawyerId !== req.user!.userId) throw new AppError('Sin acceso', 403);

    await prisma.caseNorm.delete({
        where: { caseId_legalNormId: { caseId: req.params.id, legalNormId: req.params.normId } },
    });
    res.json({ message: 'Norma desvinculada' });
}));

export default router;
