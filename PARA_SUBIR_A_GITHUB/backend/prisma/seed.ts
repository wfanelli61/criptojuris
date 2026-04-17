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

    console.log('✅ Datos cargados: 15 Abogados, 10 Clientes, 20 Citas.');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
