
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// CONFIGURACIÓN: Cambia estos valores
const EMAIL_A_CAMBIAR = 'admin@bufete.com';
const NUEVA_CONTRASEÑA = 'PON_AQUI_TU_NUEVA_CLAVE';

async function main() {
    console.log(`🔐 Cambiando contraseña para: ${EMAIL_A_CAMBIAR}...`);

    // Generar el hash seguro
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(NUEVA_CONTRASEÑA, salt);

    // Actualizar en la base de datos
    const user = await prisma.user.update({
        where: { email: EMAIL_A_CAMBIAR },
        data: { passwordHash: hash }
    });

    console.log('✅ Contraseña actualizada exitosamente en PostgreSQL.');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
