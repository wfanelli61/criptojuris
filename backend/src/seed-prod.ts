import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hash = await bcrypt.hash('123456', 10)

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@bufete.com' },
        create: { email: 'admin@bufete.com', passwordHash: hash, name: 'Administrador Senior', role: 'ADMIN', emailVerified: true },
        update: {},
    })

    // Servicios
    const serviceData = [
        { name: 'Asesoría Penal', description: 'Defensa criminal de alto nivel', price: 150, legalArea: 'PENAL' },
        { name: 'Derecho Civil', description: 'Contratos y demandas civiles', price: 100, legalArea: 'CIVIL' },
        { name: 'Derecho de Familia', description: 'Divorcios y custodias LOPNA', price: 80, legalArea: 'LOPNA' },
        { name: 'Corporativo', description: 'Gestión legal empresarial', price: 200, legalArea: 'CORPORATIVO' },
        { name: 'Laboral', description: 'Conflictos patrono-empleado', price: 90, legalArea: 'CIVIL' },
    ]
    for (const s of serviceData) {
        await prisma.service.upsert({ where: { name: s.name } as any, create: s, update: {} }).catch(() => prisma.service.create({ data: s }))
    }

    // Abogados
    const cities = ['Caracas', 'Valencia', 'Maracay', 'Barquisimeto', 'Maracaibo', 'San Cristóbal']
    const specialties = ['Penal', 'Civil', 'Laboral', 'Mercantil', 'Familia', 'Tributario']
    const lastNames = ['Pérez', 'Rodríguez', 'Gómez', 'Blanco', 'Torres']

    for (let i = 1; i <= 15; i++) {
        const email = `abogado${i}@bufete.com`
        const lawyer = await prisma.user.upsert({
            where: { email },
            create: {
                email, passwordHash: hash, role: 'ABOGADO', emailVerified: true,
                name: `Abogado ${i} - ${lastNames[i % 5]}`,
            },
            update: {},
        })
        const existing = await prisma.lawyerProfile.findUnique({ where: { userId: lawyer.id } })
        if (!existing) {
            await prisma.lawyerProfile.create({
                data: {
                    userId: lawyer.id,
                    bio: `Especialista con más de ${5 + i} años de experiencia en el área legal venezolana.`,
                    specialties: JSON.stringify([specialties[i % 6], 'Asesoría General']),
                    city: cities[i % 6],
                    languages: JSON.stringify(['Español']),
                    ratePerHour: 50 + (i * 10),
                    yearsExperience: 5 + i,
                    verificationStatus: i <= 8 ? 'APPROVED' : 'PENDING',
                    active: true,
                },
            })
        }
    }

    // Clientes
    for (let i = 1; i <= 10; i++) {
        await prisma.user.upsert({
            where: { email: `cliente${i}@bufete.com` },
            create: {
                email: `cliente${i}@bufete.com`, passwordHash: hash, role: 'CLIENTE', emailVerified: true,
                name: `Cliente ${i} - ${['García', 'Martínez', 'López', 'Hernández', 'Díaz'][i % 5]}`,
            },
            update: {},
        })
    }

    // Blog posts
    const blogPosts = [
        {
            title: 'Tus derechos ante un arresto: lo que debes saber en Venezuela',
            slug: 'derechos-ante-arresto-venezuela',
            excerpt: 'Conoce los derechos que te protegen al momento de ser detenido según el COPP.',
            content: '<h2>¿Qué derechos tienes al ser detenido?</h2><p>En Venezuela, el Código Orgánico Procesal Penal (COPP) garantiza derechos fundamentales a toda persona detenida. Tienes derecho a conocer los motivos de tu detención, comunicarte con un familiar o abogado, y no firmar documentos sin asesoría legal.</p><h2>¿Qué hacer en el momento?</h2><ul><li>Mantén la calma y no ofrezcas resistencia.</li><li>Exige conocer el motivo de la detención.</li><li>Solicita comunicarte con tu abogado o familiar.</li><li>No hagas declaraciones sin asesoría legal.</li></ul>',
            legalArea: 'PENAL', published: true, publishedAt: new Date(Date.now() - 7 * 86400000),
        },
        {
            title: 'Divorcio en Venezuela: tipos, requisitos y procedimiento',
            slug: 'divorcio-venezuela-tipos-requisitos',
            excerpt: 'Guía completa sobre los distintos tipos de divorcio en Venezuela y cómo tramitarlos.',
            content: '<h2>Tipos de divorcio en Venezuela</h2><p>El divorcio puede tramitarse por vía judicial o notarial. El <strong>divorcio por mutuo consentimiento</strong> ante notario es el más rápido cuando no hay hijos menores y ambas partes están de acuerdo. El <strong>divorcio contencioso</strong> se tramita ante el Tribunal de Protección cuando no hay acuerdo.</p><h2>Documentos necesarios</h2><ul><li>Acta de matrimonio original</li><li>Cédulas de identidad</li><li>Actas de nacimiento de los hijos (si aplica)</li></ul>',
            legalArea: 'CIVIL', published: true, publishedAt: new Date(Date.now() - 5 * 86400000),
        },
        {
            title: 'Manutención y custodia de hijos en Venezuela: preguntas frecuentes',
            slug: 'manutension-custodia-hijos-venezuela',
            excerpt: 'Todo sobre manutención, custodia compartida y régimen de convivencia según la LOPNA.',
            content: '<h2>La obligación de manutención</h2><p>La LOPNA establece que ambos padres deben proveer alimentos, educación y bienestar a sus hijos, independientemente de si conviven. El Tribunal determina el monto considerando los ingresos del obligado y las necesidades del niño.</p><h2>Custodia y régimen de convivencia</h2><p>El juez siempre decide en función del interés superior del niño. El padre sin custodia tiene derecho a un régimen de visitas que garantice el vínculo afectivo.</p>',
            legalArea: 'LOPNA', published: true, publishedAt: new Date(Date.now() - 3 * 86400000),
        },
        {
            title: 'Cómo constituir una empresa en Venezuela paso a paso',
            slug: 'constituir-empresa-venezuela-pasos',
            excerpt: 'Guía actualizada para registrar una C.A. o S.R.L. en Venezuela en 2026.',
            content: '<h2>Pasos para constituir una C.A.</h2><ol><li>Reserva del nombre en el Registro Mercantil</li><li>Elaboración del acta constitutiva</li><li>Firma ante notario público</li><li>Inscripción en el Registro Mercantil</li><li>Publicación en prensa nacional</li><li>RIF empresarial ante el SENIAT</li></ol><p>El proceso completa entre 15 y 45 días hábiles dependiendo del Registro Mercantil.</p>',
            legalArea: 'CORPORATIVO', published: true, publishedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
            title: 'Derechos laborales en Venezuela: lo que todo trabajador debe conocer',
            slug: 'derechos-laborales-venezuela-trabajadores',
            excerpt: 'Los principales derechos que protegen a los trabajadores venezolanos según la LOTTT.',
            content: '<h2>La LOTTT: tu principal protección</h2><p>La jornada diurna máxima es de 8 horas y 40 semanales. Las horas extras se pagan con recargo mínimo del 50%. Tienes derecho a al menos 15 días hábiles de vacaciones y utilidades equivalentes a un mínimo de 30 días de salario.</p><h2>¿Qué hacer si te despiden?</h2><p>Acude a la Inspectoría del Trabajo o inicia un procedimiento judicial. Tienes un año desde la terminación para reclamar tus derechos.</p>',
            legalArea: 'CIVIL', published: true, publishedAt: new Date(Date.now() - 86400000),
        },
        {
            title: 'Amparo constitucional en Venezuela: cuándo y cómo interponerlo',
            slug: 'amparo-constitucional-venezuela',
            excerpt: 'El mecanismo más rápido para proteger tus derechos constitucionales.',
            content: '<h2>¿Qué es el amparo?</h2><p>Es una acción judicial urgente que protege derechos constitucionales violados. Procede cuando existe una violación directa y actual de un derecho y no hay otra vía judicial igualmente eficaz.</p><h2>Tipos</h2><ul><li><strong>Amparo autónomo</strong></li><li><strong>Hábeas corpus</strong> (libertad personal)</li><li><strong>Hábeas data</strong> (datos personales)</li></ul><p>Debe interponerse dentro de los 6 meses desde el conocimiento del acto lesivo.</p>',
            legalArea: 'PENAL', published: true, publishedAt: new Date(),
        },
    ]

    for (const post of blogPosts) {
        const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
        if (!exists) {
            await prisma.blogPost.create({ data: { ...post, authorId: admin.id } })
        }
    }

    // Testimonios
    const testimonialCount = await prisma.testimonial.count()
    if (testimonialCount === 0) {
        await prisma.testimonial.createMany({
            data: [
                { name: 'María González', role: 'Cliente - Caso Penal', content: 'Gracias a BufeteLegal recuperé mi libertad. El equipo fue excepcional en cada paso.', rating: 5, active: true },
                { name: 'Carlos Mendoza', role: 'Empresario - Derecho Corporativo', content: 'Constituyeron mi empresa en tiempo récord y con total profesionalismo.', rating: 5, active: true },
                { name: 'Ana Torrealba', role: 'Cliente - Derecho de Familia', content: 'Mi proceso de divorcio fue manejado con mucha sensibilidad y eficiencia.', rating: 5, active: true },
                { name: 'José Ramírez', role: 'Trabajador - Caso Laboral', content: 'Recuperé mis prestaciones sociales gracias a su asesoría. Los mejores en materia laboral.', rating: 4, active: true },
            ]
        })
    }

    console.log('Seed completo: admin, 15 abogados, 10 clientes, servicios, blog, testimonios.')
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
