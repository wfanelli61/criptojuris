import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.appointmentRequest.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.service.deleteMany();
    await prisma.lawyerProfile.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('123456', 12);

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@bufete.com',
            passwordHash,
            name: 'Administrador',
            role: 'ADMIN',
            phone: '+58 412-000-0001',
            emailVerified: true,
        },
    });

    // Create a Lawyer
    const lawyer = await prisma.user.create({
        data: {
            email: 'abogado@test.com',
            passwordHash,
            name: 'Dr. Manuel García',
            role: 'ABOGADO',
            phone: '+58 414-111-2222',
            emailVerified: true,
            lawyerProfile: {
                create: {
                    bio: 'Especialista en Derecho Civil y Penal con más de 10 años de experiencia.',
                    specialties: JSON.stringify(['Derecho Civil', 'Derecho Penal']),
                    city: 'Caracas',
                    ratePerHour: 50,
                    yearsExperience: 10,
                    active: true,
                    verificationStatus: 'APPROVED'
                }
            }
        }
    });

    // Create Services
    const service1 = await prisma.service.create({
        data: {
            name: 'Consulta Legal General',
            description: 'Asesoría legal inicial para evaluar su caso y determinar los pasos a seguir.',
            icon: '⚖️',
            active: true,
        },
    });

    const service2 = await prisma.service.create({
        data: {
            name: 'Representación en Juicio',
            description: 'Representación completa en procesos judiciales civiles, penales o laborales.',
            icon: '🏛️',
            active: true,
        },
    });

    const service3 = await prisma.service.create({
        data: {
            name: 'Redacción de Contratos',
            description: 'Elaboración y revisión de contratos comerciales, laborales y de arrendamiento.',
            icon: '📝',
            active: true,
        },
    });

    const service4 = await prisma.service.create({
        data: {
            name: 'Asesoría Empresarial',
            description: 'Consultoría legal integral para empresas: constitución, cumplimiento normativo.',
            icon: '🏢',
            active: true,
        },
    });

    const service5 = await prisma.service.create({
        data: {
            name: 'Derecho de Familia',
            description: 'Asesoría y representación en divorcios, custodia, pensión alimenticia.',
            icon: '👨‍👩‍👧‍👦',
            active: true,
        },
    });

    const service6 = await prisma.service.create({
        data: {
            name: 'Derecho Inmobiliario',
            description: 'Gestión de compraventa de inmuebles, hipotecas, arrendamientos.',
            icon: '🏠',
            active: true,
        },
    });

    // Create Testimonials
    await prisma.testimonial.createMany({
        data: [
            {
                clientName: 'Roberto Hernández',
                clientRole: 'Empresario',
                rating: 5,
                content: 'Excelente servicio.',
                approved: true,
            },
            {
                clientName: 'Carmen Díaz',
                clientRole: 'Comerciante',
                rating: 5,
                content: 'Atención excelente.',
                approved: true,
            }
        ],
    });

    console.log('✅ Seed completado exitosamente!');
    console.log('📧 Credenciales de prueba (contraseña: 123456):');
    console.log('   Admin: admin@bufete.com');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
