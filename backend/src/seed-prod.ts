import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Limpiando base de datos...')

    // Borrar todo en orden correcto (respetando foreign keys)
    const del = async (fn: () => Promise<any>) => { try { await fn() } catch (_) {} }

    await del(() => (prisma as any).casePayment.deleteMany())
    await del(() => (prisma as any).caseEvent.deleteMany())
    await del(() => prisma.review.deleteMany())
    await del(() => prisma.caseDocument.deleteMany())
    await del(() => prisma.serviceContract.deleteMany())
    await del(() => prisma.budget.deleteMany())
    await del(() => prisma.legalCase.deleteMany())
    await del(() => prisma.message.deleteMany())
    await del(() => prisma.conversation.deleteMany())
    await del(() => prisma.appointmentRequest.deleteMany())
    await del(() => prisma.notification.deleteMany())
    await del(() => prisma.supportTicket.deleteMany())
    await del(() => prisma.blogPost.deleteMany())
    await del(() => prisma.availabilitySlot.deleteMany())
    await del(() => prisma.subscription.deleteMany())
    await del(() => prisma.lawyerProfile.deleteMany())
    await del(() => prisma.testimonial.deleteMany())
    await del(() => prisma.service.deleteMany())

    // Borrar solo abogados y clientes (no admin)
    await del(() => prisma.user.deleteMany({ where: { role: { in: ['ABOGADO', 'CLIENTE'] } } }))

    // Asegurar que el admin existe
    const hash = await bcrypt.hash('123456', 10)
    await prisma.user.upsert({
        where: { email: 'admin@bufete.com' },
        create: { email: 'admin@bufete.com', passwordHash: hash, name: 'Administrador', role: 'ADMIN', emailVerified: true },
        update: { passwordHash: hash },
    })

    console.log('Listo: base de datos limpia, solo queda el admin.')
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
