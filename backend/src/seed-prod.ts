import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hash = await bcrypt.hash('123456', 10)

    // Borrar cualquier admin previo con emails distintos
    await prisma.user.deleteMany({ where: { role: 'ADMIN' } })

    await prisma.user.create({
        data: {
            email: 'admin@bufete.com',
            passwordHash: hash,
            name: 'Administrador',
            role: 'ADMIN',
            emailVerified: true,
        },
    })

    console.log('Admin listo: admin@bufete.com / 123456')
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
