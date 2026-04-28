import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Iniciando carga masiva de datos profesionales...')

    // Limpieza total
    await prisma.message.deleteMany()
    await prisma.appointmentRequest.deleteMany()
    await prisma.lawyerProfile.deleteMany()
    await prisma.testimonial.deleteMany()
    await prisma.service.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await bcrypt.hash('123456', 10)

    // 1. Admin
    await prisma.user.create({
        data: {
            email: 'admin@bufete.com',
            passwordHash,
            name: 'Administrador Senior',
            role: 'ADMIN',
            emailVerified: true,
        },
    });

    // 2. Servicios Base
    const services = await Promise.all([
        prisma.service.create({ data: { name: 'Asesoría Penal', description: 'Defensa criminal de alto nivel', price: 150 } }),
        prisma.service.create({ data: { name: 'Derecho Civil', description: 'Contratos y demandas civiles', price: 100 } }),
        prisma.service.create({ data: { name: 'Derecho de Familia', description: 'Divorcios y custodias', price: 80 } }),
        prisma.service.create({ data: { name: 'Corporativo', description: 'Gestión legal empresarial', price: 200 } }),
        prisma.service.create({ data: { name: 'Laboral', description: 'Conflictos patrono-empleado', price: 90 } }),
    ]);

    // 3. Crear 15 Abogados
    const cities = ['Caracas', 'Valencia', 'Maracay', 'Barquisimeto', 'Maracaibo', 'San Cristóbal'];
    const specialties = ['Penal', 'Civil', 'Laboral', 'Mercantil', 'Familia', 'Tributario'];
    const lawyers = [];

    for (let i = 1; i <= 15; i++) {
        const name = `Abogado ${i} - ${['Pérez', 'Rodríguez', 'Gómez', 'Blanco', 'Torres'][i % 5]}`;
        const law = await prisma.user.create({
            data: {
                email: `abogado${i}@bufete.com`,
                passwordHash,
                name,
                role: 'ABOGADO',
                emailVerified: true,
            },
        });
        await prisma.lawyerProfile.create({
            data: {
                userId: law.id,
                bio: `Especialista senior con más de ${5 + i} años de experiencia en el área legal.`,
                specialties: JSON.stringify([specialties[i % 6], 'Asesoría General']),
                city: cities[i % 6],
                ratePerHour: 50 + (i * 10),
                yearsExperience: 5 + i,
                verificationStatus: 'APPROVED'
            }
        });
        lawyers.push(law);
    }

    // 4. Crear 10 Clientes
    const clients = [];
    for (let i = 1; i <= 10; i++) {
        const cli = await prisma.user.create({
            data: {
                email: `cliente${i}@bufete.com`,
                passwordHash,
                name: `Cliente ${i} - ${['Sosa', 'Méndez', 'Vivas'][i % 3]}`,
                role: 'CLIENTE',
                emailVerified: true,
            },
        });
        clients.push(cli);
    }

    // 5. Crear 20 Citas Programadas
    for (let i = 0; i < 20; i++) {
        const client = clients[i % 10];
        const lawyer = lawyers[i % 15];
        const service = services[i % 5];
        
        await prisma.appointmentRequest.create({
            data: {
                clientId: client.id,
                lawyerId: lawyer.id,
                serviceId: service.id,
                message: `Solicitud de asesoría legal para caso número ${i + 100}`,
                status: i % 3 === 0 ? 'PENDIENTE' : i % 3 === 1 ? 'CONFIRMADA' : 'FINALIZADA',
                preferredDate: new Date(Date.now() + (i * 86400000)).toISOString(),
            }
        });
    }

    // 5. Blog posts
    await prisma.blogPost.deleteMany()
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    const blogPosts = [
        {
            title: 'Tus derechos ante un arresto: lo que debes saber en Venezuela',
            slug: 'derechos-ante-arresto-venezuela',
            excerpt: 'Conoce los derechos que te protegen al momento de ser detenido y cómo actuar correctamente según el COPP.',
            content: `<h2>¿Qué derechos tienes al ser detenido?</h2><p>En Venezuela, el Código Orgánico Procesal Penal (COPP) garantiza una serie de derechos fundamentales a toda persona que sea detenida. Conocerlos puede marcar la diferencia entre una detención arbitraria y el ejercicio pleno de tus garantías constitucionales.</p><h2>Derecho a ser informado</h2><p>Tienes derecho a conocer los motivos de tu detención de forma inmediata y clara. Ningún funcionario puede detenerte sin expresar las razones legales que justifican ese acto.</p><h2>Derecho a comunicarte</h2><p>Debes poder contactar a un familiar o abogado de confianza. La incomunicación arbitraria es ilegal según el artículo 44 de la Constitución venezolana.</p><h2>Derecho a un abogado</h2><p>Si no puedes costear uno, el Estado debe proveer un defensor público. No firmes ningún documento sin la presencia de tu representante legal.</p><h2>¿Qué hacer en el momento?</h2><ul><li>Mantén la calma y no ofrezcas resistencia.</li><li>Exige conocer el motivo de la detención.</li><li>Solicita comunicarte con tu abogado o familiar.</li><li>No hagas declaraciones sin asesoría legal.</li></ul>`,
            legalArea: 'PENAL',
            published: true,
            publishedAt: new Date(Date.now() - 7 * 86400000),
        },
        {
            title: 'Divorcio en Venezuela: tipos, requisitos y procedimiento',
            slug: 'divorcio-venezuela-tipos-requisitos',
            excerpt: 'Guía completa sobre los distintos tipos de divorcio que existen en Venezuela y cómo tramitarlos correctamente.',
            content: `<h2>Tipos de divorcio en Venezuela</h2><p>En Venezuela el divorcio puede tramitarse por vía judicial o, desde 2015, mediante la vía notarial cuando ambas partes están de acuerdo y no hay hijos menores de edad.</p><h2>Divorcio por mutuo consentimiento</h2><p>Es el proceso más rápido. Ambos cónyuges comparecen ante un notario público y expresan su voluntad de disolver el vínculo. Se perfecciona en pocos días.</p><h2>Divorcio contencioso</h2><p>Cuando no hay acuerdo, debe acudirse al Tribunal de Protección del Niño, Niña y Adolescente o al Tribunal de Municipio. Las causales están en el artículo 185 del Código Civil.</p><h2>Documentos necesarios</h2><ul><li>Acta de matrimonio original y copia certificada</li><li>Cédulas de identidad de ambos cónyuges</li><li>Actas de nacimiento de los hijos (si aplica)</li></ul>`,
            legalArea: 'CIVIL',
            published: true,
            publishedAt: new Date(Date.now() - 5 * 86400000),
        },
        {
            title: 'Manutención y custodia de hijos en Venezuela: preguntas frecuentes',
            slug: 'manutension-custodia-hijos-venezuela',
            excerpt: 'Todo lo que necesitas saber sobre obligación de manutención, custodia compartida y régimen de convivencia según la LOPNA.',
            content: `<h2>La obligación de manutención</h2><p>La Ley Orgánica para la Protección del Niño, Niña y Adolescente (LOPNA) establece que ambos padres tienen la obligación de proveer alimentos, educación, salud y bienestar a sus hijos, independientemente de si conviven.</p><h2>¿Cómo se calcula la manutención?</h2><p>El Tribunal determina el monto considerando los ingresos del obligado, las necesidades del niño y el nivel de vida que tenía la familia.</p><h2>Custodia y responsabilidad de crianza</h2><p>Puede ser ejercida por uno o ambos padres. El juez siempre decide en función del interés superior del niño.</p><h2>Régimen de convivencia familiar</h2><p>El padre o madre que no tenga la custodia tiene derecho a un régimen de visitas. Puede ser acordado por las partes o establecido por el tribunal.</p>`,
            legalArea: 'LOPNA',
            published: true,
            publishedAt: new Date(Date.now() - 3 * 86400000),
        },
        {
            title: 'Cómo constituir una empresa en Venezuela paso a paso',
            slug: 'constituir-empresa-venezuela-pasos',
            excerpt: 'Guía actualizada para registrar una Compañía Anónima o Sociedad de Responsabilidad Limitada en Venezuela en 2026.',
            content: `<h2>Tipos de empresa más comunes</h2><p>En Venezuela las formas societarias más utilizadas son la Compañía Anónima (C.A.) y la Sociedad de Responsabilidad Limitada (S.R.L.).</p><h2>Pasos para constituir una C.A.</h2><ol><li><strong>Reserva del nombre:</strong> Verifica que no esté registrado en el Registro Mercantil.</li><li><strong>Elaboración del acta constitutiva:</strong> Incluye objeto social, capital, acciones y estatutos.</li><li><strong>Firma ante notario:</strong> Los fundadores firman el acta ante notario público.</li><li><strong>Inscripción en el Registro Mercantil.</strong></li><li><strong>Publicación en prensa nacional.</strong></li><li><strong>RIF empresarial ante el SENIAT.</strong></li></ol><h2>¿Cuánto tiempo tarda?</h2><p>Entre 15 y 45 días hábiles dependiendo del Registro Mercantil.</p>`,
            legalArea: 'CORPORATIVO',
            published: true,
            publishedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
            title: 'Derechos laborales en Venezuela: lo que todo trabajador debe conocer',
            slug: 'derechos-laborales-venezuela-trabajadores',
            excerpt: 'Un resumen de los principales derechos que protegen a los trabajadores venezolanos según la LOTTT.',
            content: `<h2>La LOTTT: tu principal protección</h2><p>La Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT) regula las relaciones laborales en Venezuela.</p><h2>Jornada de trabajo</h2><p>La jornada diurna máxima es de 8 horas diarias y 40 semanales. Las horas extras se pagan con un recargo mínimo del 50%.</p><h2>Vacaciones y utilidades</h2><p>Tienes derecho a al menos 15 días hábiles de vacaciones anuales y utilidades equivalentes a un mínimo de 30 días de salario.</p><h2>Prestaciones sociales</h2><p>Tienes derecho a prestaciones calculadas con base en tu salario integral. Debes recibirlas al finalizar la relación laboral.</p><h2>¿Qué hacer si te despiden injustificadamente?</h2><p>Acude a la Inspectoría del Trabajo o inicia un procedimiento judicial. Tienes un año desde la terminación para reclamar.</p>`,
            legalArea: 'CIVIL',
            published: true,
            publishedAt: new Date(Date.now() - 86400000),
        },
        {
            title: 'Amparo constitucional en Venezuela: cuándo y cómo interponerlo',
            slug: 'amparo-constitucional-venezuela',
            excerpt: 'El amparo es el mecanismo más rápido para proteger tus derechos constitucionales. Aprende cuándo procede y cómo solicitarlo.',
            content: `<h2>¿Qué es el amparo constitucional?</h2><p>Es una acción judicial urgente que protege los derechos y garantías constitucionales cuando han sido violados por un acto u omisión de un funcionario público o particular.</p><h2>¿Cuándo procede?</h2><p>Cuando existe una violación directa y actual de un derecho constitucional y no hay otra vía judicial igualmente eficaz.</p><h2>Tipos de amparo</h2><ul><li><strong>Amparo autónomo:</strong> Acción principal para restablecer derechos.</li><li><strong>Amparo cautelar:</strong> Medida preventiva junto a otra demanda.</li><li><strong>Hábeas corpus:</strong> Para proteger la libertad personal.</li><li><strong>Hábeas data:</strong> Para el acceso y rectificación de datos personales.</li></ul><h2>Plazo</h2><p>Debe interponerse dentro de los 6 meses siguientes al conocimiento del acto lesivo.</p>`,
            legalArea: 'PENAL',
            published: true,
            publishedAt: new Date(),
        },
    ]

    for (const post of blogPosts) {
        await prisma.blogPost.create({ data: { ...post, authorId: adminUser!.id } })
    }

    // 6. Testimonios
    await prisma.testimonial.deleteMany()
    await prisma.testimonial.createMany({
        data: [
            { name: 'María González', role: 'Cliente - Caso Penal', content: 'Gracias a BufeteLegal recuperé mi libertad. El equipo fue excepcional en cada paso del proceso.', rating: 5, active: true },
            { name: 'Carlos Mendoza', role: 'Empresario - Derecho Corporativo', content: 'Constituyeron mi empresa en tiempo récord y con total profesionalismo. Los recomiendo ampliamente.', rating: 5, active: true },
            { name: 'Ana Torrealba', role: 'Cliente - Derecho de Familia', content: 'Mi proceso de divorcio fue manejado con mucha sensibilidad y eficiencia. Excelente equipo humano.', rating: 5, active: true },
            { name: 'José Ramírez', role: 'Trabajador - Caso Laboral', content: 'Recuperé mis prestaciones sociales gracias a su asesoría. Los mejores en materia laboral.', rating: 4, active: true },
        ]
    })

    console.log('Datos cargados: 15 Abogados, 10 Clientes, 20 Citas, 6 Articulos Blog, 4 Testimonios.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
