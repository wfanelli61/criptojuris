import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    role: z.enum(['CLIENTE', 'ABOGADO']),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
});

export const updateLawyerProfileSchema = z.object({
    bio: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    city: z.string().optional(),
    languages: z.array(z.string()).optional(),
    ratePerHour: z.number().positive().optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    yearsExperience: z.number().int().min(0).optional(),
});

export const createAppointmentSchema = z.object({
    lawyerId: z.string().optional(),
    serviceId: z.string().min(1, 'El servicio es requerido'),
    message: z.string().optional(),
    preferredDate: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
    status: z.enum(['CONFIRMADA', 'CANCELADA', 'FINALIZADA']),
});

export const serviceSchema = z.object({
    name: z.string().min(2, 'El nombre es requerido'),
    description: z.string().optional(),
    icon: z.string().optional(),
    active: z.boolean().optional(),
});

export const testimonialSchema = z.object({
    clientName: z.string().min(2, 'El nombre es requerido'),
    clientRole: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
    approved: z.boolean().optional(),
});

export const adminCreateUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(2, 'El nombre es requerido'),
    phone: z.string().optional(),
    role: z.enum(['CLIENTE', 'ABOGADO', 'ADMIN']),
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const lawyerVerificationSchema = z.object({
    dni: z.string().min(1, 'DNI es requerido'),
    collegeId: z.string().min(1, 'Número de colegiatura es requerido'),
    collegeName: z.string().min(1, 'Colegio de abogados es requerido'),
    country: z.string().min(1, 'País es requerido'),
    city: z.string().min(1, 'Ciudad es requerida'),
    gradYear: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
    university: z.string().min(1, 'Universidad es requerida'),
    phone: z.string().min(1, 'Teléfono es requerido'),
    email: z.string().email('Email profesional inválido'),
    specialties: z.array(z.string()).min(1, 'Seleccione al menos una especialidad'),
    mainExpYears: z.coerce.number().int().min(0).default(0),
    postgrad: z.string().default('No posee'),
    totalYears: z.coerce.number().int().min(0).default(0),
    firms: z.string().optional().default(''),
    companies: z.string().optional().default(''),
    casesLast3Years: z.coerce.number().int().min(0).default(0),
    complexCaseStory: z.string().min(10, 'Debe ser más detallado (mínimo 10 caracteres)'),
    conflictHandling: z.string().min(1, 'Requerido'),
    ethicsResponse: z.string().min(1, 'Requerido'),
    feeStructure: z.string().min(1, 'Requerido'),
    updateMethod: z.string().min(1, 'Requerido'),
    linkedin: z.string().optional().default(''),
    website: z.string().optional().default(''),
    references: z.array(z.object({
        name: z.string().default(''),
        role: z.string().default(''),
        contact: z.string().default(''),
    })).default([]),
    hasSanctions: z.boolean().default(false),
    sanctionExpl: z.string().optional().default(''),
    modality: z.enum(['Presencial', 'Online', 'Mixto']).default('Mixto'),
    responseTime: z.string().min(1, 'Seleccione tiempo de respuesta').default('Mismo día'),
    firstConsultFree: z.boolean().default(false),
    languages: z.array(z.string()).default(['Español']),
    availability: z.string().min(1, 'Horario es requerido').default('Lun-Vie 8am-5pm'),
});
