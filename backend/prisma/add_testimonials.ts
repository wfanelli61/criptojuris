import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Agregando testimonios profesionales...')

    const testimonials = [
        {
            name: 'Carlos Mendoza',
            role: 'Empresario',
            content: 'Excelente servicio. El abogado atendió mi caso mercantil con gran profesionalismo y logramos un acuerdo satisfactorio en tiempo récord. Muy recomendado.',
            rating: 5
        },
        {
            name: 'Elena Rodríguez',
            role: 'Madre de Familia',
            content: 'Gracias al equipo de BufeteLegal pude resolver mi caso de custodia de manera pacífica y justa. Siempre me sentí apoyada y bien informada.',
            rating: 5
        },
        {
            name: 'Miguel Ángel Torres',
            role: 'Director de RH',
            content: 'Llevamos años trabajando con ellos para nuestra asesoría laboral corporativa. Su conocimiento de la ley es impecable y siempre están disponibles para emergencias.',
            rating: 5
        },
        {
            name: 'Sofía Valera',
            role: 'Emprendedora',
            content: 'Me ayudaron con el registro de mi marca y la redacción de contratos para mis empleados. Explicaron todo en términos sencillos y a un precio justo.',
            rating: 4
        },
        {
            name: 'Javier Castillo',
            role: 'Cliente Particular',
            content: 'Tuve un problema con un contrato de arrendamiento y en una sola consulta me aclararon el camino a seguir. Son honestos y directos.',
            rating: 5
        }
    ];

    for (const t of testimonials) {
        await prisma.testimonial.create({
            data: t
        });
    }

    console.log(`✅ ${testimonials.length} testimonios agregados exitosamente.`);
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
