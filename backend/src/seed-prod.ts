import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hash = await bcrypt.hash('admin2024', 10)

    await prisma.user.upsert({
        where: { email: 'admin@bufetelegal.com' },
        create: {
            email: 'admin@bufetelegal.com',
            passwordHash: hash,
            name: 'Administrador',
            role: 'ADMIN',
            emailVerified: true,
        },
        update: {},
    })

    console.log('Admin listo: admin@bufetelegal.com / admin2024')
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
