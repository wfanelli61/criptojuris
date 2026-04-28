import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function slug(t: string) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
function cuid() { return 'c' + Math.random().toString(36).slice(2,15) + Math.random().toString(36).slice(2,15) }

async function main() {
    console.log('Iniciando seed masivo...')
    const hash = await bcrypt.hash('123456', 10)

    // ── Admin ──────────────────────────────────────────────────────────────────
    await prisma.user.upsert({
        where: { email: 'admin@bufete.com' },
        create: { email: 'admin@bufete.com', passwordHash: hash, name: 'Administrador', role: 'ADMIN', emailVerified: true },
        update: { passwordHash: hash },
    })

    // ── Limpiar datos de prueba previos ────────────────────────────────────────
    await prisma.casePayment.deleteMany()
    await prisma.caseEvent.deleteMany()
    await prisma.review.deleteMany()
    await prisma.caseDocument.deleteMany()
    await prisma.serviceContract.deleteMany()
    await prisma.budget.deleteMany()
    await prisma.legalCase.deleteMany()
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.appointmentRequest.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.blogPost.deleteMany()
    await prisma.availabilitySlot.deleteMany()
    await prisma.lawyerProfile.deleteMany()
    await prisma.testimonial.deleteMany()
    await prisma.service.deleteMany()
    await prisma.user.deleteMany({ where: { role: { in: ['ABOGADO', 'CLIENTE'] } } })

    // ── Servicios ──────────────────────────────────────────────────────────────
    const services = await Promise.all([
        prisma.service.create({ data: { name: 'Defensa Penal', description: 'Defensa en procesos penales, audiencias y recursos', price: 800, legalArea: 'PENAL' } }),
        prisma.service.create({ data: { name: 'Derecho Civil', description: 'Contratos, demandas civiles y cobro de deudas', price: 500, legalArea: 'CIVIL' } }),
        prisma.service.create({ data: { name: 'Derecho de Familia LOPNA', description: 'Custodia, divorcio y manutención de menores', price: 400, legalArea: 'LOPNA' } }),
        prisma.service.create({ data: { name: 'Derecho Corporativo', description: 'Constitución de empresas y contratos mercantiles', price: 1200, legalArea: 'CORPORATIVO' } }),
        prisma.service.create({ data: { name: 'Asesoría Laboral', description: 'Despidos, prestaciones y conflictos laborales', price: 350, legalArea: 'CIVIL' } }),
        prisma.service.create({ data: { name: 'Amparo Constitucional', description: 'Protección de derechos fundamentales', price: 600, legalArea: 'PENAL' } }),
    ])

    // ── 20 Abogados ────────────────────────────────────────────────────────────
    const lawyerData = [
        { name: 'Dra. María Elena Rodríguez', city: 'Caracas',      specs: ['Penal','Amparo'],          area: 'PENAL',       status: 'APPROVED', rate: 120, years: 18 },
        { name: 'Dr. Carlos Andrés Pérez',    city: 'Valencia',     specs: ['Civil','Contratos'],        area: 'CIVIL',       status: 'APPROVED', rate: 90,  years: 12 },
        { name: 'Dra. Luisa Fernanda Gómez',  city: 'Maracaibo',    specs: ['Familia','LOPNA'],          area: 'LOPNA',       status: 'APPROVED', rate: 80,  years: 9  },
        { name: 'Dr. Alejandro Torres',       city: 'Barquisimeto', specs: ['Corporativo','Mercantil'],  area: 'CORPORATIVO', status: 'APPROVED', rate: 150, years: 22 },
        { name: 'Dra. Ana Sofía Blanco',      city: 'Caracas',      specs: ['Laboral','Previsión'],      area: 'CIVIL',       status: 'APPROVED', rate: 70,  years: 7  },
        { name: 'Dr. José Miguel Herrera',    city: 'Maturín',      specs: ['Penal','Tráfico'],          area: 'PENAL',       status: 'APPROVED', rate: 100, years: 15 },
        { name: 'Dra. Carmen López',          city: 'San Cristóbal',specs: ['Civil','Inmobiliario'],     area: 'CIVIL',       status: 'APPROVED', rate: 85,  years: 11 },
        { name: 'Dr. Roberto Castillo',       city: 'Caracas',      specs: ['Corporativo','Tributario'], area: 'CORPORATIVO', status: 'APPROVED', rate: 200, years: 25 },
        { name: 'Dra. Valentina Morales',     city: 'Maracay',      specs: ['Familia','Divorcios'],      area: 'LOPNA',       status: 'APPROVED', rate: 75,  years: 8  },
        { name: 'Dr. Andrés Felipe Suárez',   city: 'Valencia',     specs: ['Penal','Drogas'],           area: 'PENAL',       status: 'APPROVED', rate: 110, years: 14 },
        { name: 'Dra. Patricia Ramírez',      city: 'Caracas',      specs: ['Laboral','Sindicatos'],     area: 'CIVIL',       status: 'APPROVED', rate: 65,  years: 6  },
        { name: 'Dr. Eduardo Vargas',         city: 'Barquisimeto', specs: ['Corporativo','Fusiones'],   area: 'CORPORATIVO', status: 'APPROVED', rate: 180, years: 20 },
        { name: 'Dra. Gabriela Mendoza',      city: 'Puerto Ordaz', specs: ['Civil','Sucesiones'],       area: 'CIVIL',       status: 'APPROVED', rate: 95,  years: 13 },
        { name: 'Dr. Franklin Ortega',        city: 'Caracas',      specs: ['Penal','Corrupción'],       area: 'PENAL',       status: 'APPROVED', rate: 130, years: 16 },
        { name: 'Dra. Isabel Díaz',           city: 'Mérida',       specs: ['Familia','Adopción'],       area: 'LOPNA',       status: 'APPROVED', rate: 70,  years: 8  },
        { name: 'Dr. Óscar Fuentes',          city: 'Caracas',      specs: ['Corporativo','Startups'],   area: 'CORPORATIVO', status: 'PENDING',  rate: 140, years: 5  },
        { name: 'Dra. Marlene Castro',        city: 'Valencia',     specs: ['Civil','Arrendamiento'],    area: 'CIVIL',       status: 'PENDING',  rate: 60,  years: 3  },
        { name: 'Dr. Simón Delgado',          city: 'Caracas',      specs: ['Penal','Extradición'],      area: 'PENAL',       status: 'PENDING',  rate: 160, years: 19 },
        { name: 'Dra. Natalia Jiménez',       city: 'Maracaibo',    specs: ['Laboral','INPSASEL'],       area: 'CIVIL',       status: 'REJECTED', rate: 55,  years: 2  },
        { name: 'Dr. Ramón Contreras',        city: 'Barinas',      specs: ['Civil','Rural'],            area: 'CIVIL',       status: 'REJECTED', rate: 50,  years: 1  },
    ]

    const lawyers: any[] = []
    for (const l of lawyerData) {
        const email = slug(l.name.replace('Dr. ','').replace('Dra. ','')) + '@bufete.com'
        const user = await prisma.user.create({
            data: { email, passwordHash: hash, name: l.name, role: 'ABOGADO', emailVerified: true },
        })
        const profile = await prisma.lawyerProfile.create({
            data: {
                userId: user.id,
                bio: `${l.name.includes('Dra') ? 'Abogada' : 'Abogado'} especialista en ${l.specs.join(' y ')} con ${l.years} años de experiencia en Venezuela.`,
                specialties: JSON.stringify(l.specs),
                city: l.city, languages: JSON.stringify(['Español', 'Inglés']),
                ratePerHour: l.rate, yearsExperience: l.years,
                verificationStatus: l.status, active: l.status !== 'REJECTED',
            },
        })
        // Disponibilidad
        for (const day of [1, 2, 3, 4, 5]) {
            await prisma.availabilitySlot.create({
                data: { lawyerId: user.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00', isRecurring: true },
            })
        }
        lawyers.push({ user, profile, area: l.area })
    }

    // ── 15 Clientes ───────────────────────────────────────────────────────────
    const clientData = [
        { name: 'Pedro Antonio Martínez',   email: 'pedro.martinez@gmail.com'   },
        { name: 'Laura Beatriz Sánchez',     email: 'laura.sanchez@gmail.com'    },
        { name: 'Miguel Ángel Flores',       email: 'miguel.flores@gmail.com'    },
        { name: 'Sofía Alejandra Núñez',     email: 'sofia.nunez@gmail.com'      },
        { name: 'Diego Armando Reyes',       email: 'diego.reyes@gmail.com'      },
        { name: 'Valentina Castillo',        email: 'valentina.castillo@gmail.com'},
        { name: 'Andrés Eloy Ramos',         email: 'andres.ramos@gmail.com'     },
        { name: 'Carmen Gloria Villalobos',  email: 'carmen.villalobos@gmail.com'},
        { name: 'Jorge Luis Medina',         email: 'jorge.medina@gmail.com'     },
        { name: 'Alejandra Mora',            email: 'alejandra.mora@gmail.com'   },
        { name: 'Francisco Javier Peña',     email: 'francisco.pena@gmail.com'   },
        { name: 'Mariela Torres',            email: 'mariela.torres@gmail.com'   },
        { name: 'Gustavo Adolfo Ríos',       email: 'gustavo.rios@gmail.com'     },
        { name: 'Daniela Esperanza Cruz',    email: 'daniela.cruz@gmail.com'     },
        { name: 'Roberto José Infante',      email: 'roberto.infante@gmail.com'  },
    ]
    const clients: any[] = []
    for (const c of clientData) {
        const user = await prisma.user.create({
            data: { email: c.email, passwordHash: hash, name: c.name, role: 'CLIENTE', emailVerified: true },
        })
        clients.push(user)
    }

    // ── Casos legales en todos los estados ────────────────────────────────────
    const caseTemplates = [
        // EN_CURSO (con presupuesto, contrato y eventos)
        { title: 'Defensa por acusación de estafa agravada', area: 'PENAL', status: 'EN_CURSO', lawyerIdx: 0, clientIdx: 0,
          desc: 'Cliente acusado de estafa agravada por supuesta apropiación de fondos de empresa. Se requiere defensa integral.' },
        { title: 'Demanda por incumplimiento de contrato de obra', area: 'CIVIL', status: 'EN_CURSO', lawyerIdx: 1, clientIdx: 1,
          desc: 'Contratista incumplió contrato de construcción por Bs. 45.000. Se reclaman daños y perjuicios.' },
        { title: 'Custodia compartida de dos menores', area: 'LOPNA', status: 'EN_CURSO', lawyerIdx: 2, clientIdx: 2,
          desc: 'Proceso de divorcio con disputa por custodia de hijos de 7 y 10 años. Padre solicita régimen compartido.' },
        { title: 'Constitución de sociedad anónima comercial', area: 'CORPORATIVO', status: 'EN_CURSO', lawyerIdx: 3, clientIdx: 3,
          desc: 'Constitución de C.A. para distribución de alimentos. Capital inicial 50.000 USD. 3 socios fundadores.' },
        { title: 'Reclamo por despido injustificado PDVSA', area: 'CIVIL', status: 'EN_CURSO', lawyerIdx: 4, clientIdx: 4,
          desc: 'Trabajador despedido después de 15 años de servicio sin causa justificada. Reclama prestaciones y bonos.' },
        { title: 'Amparo por detención arbitraria', area: 'PENAL', status: 'EN_CURSO', lawyerIdx: 5, clientIdx: 5,
          desc: 'Cliente detenido por 72 horas sin orden judicial. Se interpone amparo constitucional urgente.' },
        { title: 'Cobro ejecutivo de letra de cambio', area: 'CIVIL', status: 'EN_CURSO', lawyerIdx: 6, clientIdx: 6,
          desc: 'Letra de cambio por 18.000 USD vencida e impaga. Se solicita embargo preventivo de bienes.' },
        { title: 'Fusión de dos empresas distribuidoras', area: 'CORPORATIVO', status: 'EN_CURSO', lawyerIdx: 7, clientIdx: 7,
          desc: 'Asesoría legal completa para fusión por absorción de dos C.A. del sector distribución.' },
        // PRESUPUESTO_APROBADO
        { title: 'Divorcio contencioso con bienes en disputa', area: 'LOPNA', status: 'PRESUPUESTO_APROBADO', lawyerIdx: 8, clientIdx: 8,
          desc: 'Divorcio con bienes inmuebles en disputa: dos apartamentos y vehículos. Se aplica comunidad conyugal.' },
        { title: 'Defensa en proceso por homicidio culposo', area: 'PENAL', status: 'PRESUPUESTO_APROBADO', lawyerIdx: 9, clientIdx: 9,
          desc: 'Accidente de tránsito con resultado de muerte. Cliente conductor solicita defensa activa.' },
        // PRESUPUESTO_ENVIADO
        { title: 'Registro de marca comercial en SAPI', area: 'CORPORATIVO', status: 'PRESUPUESTO_ENVIADO', lawyerIdx: 11, clientIdx: 10,
          desc: 'Registro de marca de ropa deportiva venezolana ante el Servicio Autónomo de Propiedad Intelectual.' },
        { title: 'Reclamación de herencia y sucesión', area: 'CIVIL', status: 'PRESUPUESTO_ENVIADO', lawyerIdx: 12, clientIdx: 11,
          desc: 'Cliente reclama parte de herencia de padre fallecido. Existen otros herederos que impugnan el testamento.' },
        // SOLICITUD (nuevos sin asignar o recién asignados)
        { title: 'Pensión de alimentos para menor de edad', area: 'LOPNA', status: 'SOLICITUD', lawyerIdx: 14, clientIdx: 12,
          desc: 'Madre solicita fijación de pensión alimentaria. Padre tiene ingresos en dólares en empresa privada.' },
        { title: 'Querella por difamación en redes sociales', area: 'PENAL', status: 'SOLICITUD', lawyerIdx: 13, clientIdx: 13,
          desc: 'Empresario querella a influencer por publicaciones difamatorias en Instagram con 500k seguidores.' },
        { title: 'Contrato de arrendamiento comercial', area: 'CIVIL', status: 'SOLICITUD', lawyerIdx: 1, clientIdx: 14,
          desc: 'Revisión y negociación de contrato de arrendamiento de local comercial en centro comercial de Caracas.' },
        // CERRADO
        { title: 'Divorcio por mutuo consentimiento', area: 'LOPNA', status: 'CERRADO', lawyerIdx: 2, clientIdx: 0,
          desc: 'Proceso de divorcio sin hijos menores tramitado ante notaría. Concluido satisfactoriamente.' },
        { title: 'Cobro de cheque sin fondos', area: 'CIVIL', status: 'CERRADO', lawyerIdx: 6, clientIdx: 3,
          desc: 'Cheque por 8.000 USD devuelto sin fondos. Se logró acuerdo extrajudicial con pago total.' },
        // CANCELADO
        { title: 'Recurso contencioso administrativo SENIAT', area: 'CORPORATIVO', status: 'CANCELADO', lawyerIdx: 3, clientIdx: 5,
          desc: 'Recurso contra multa del SENIAT. Cliente decidió pagar la multa y canceló el proceso legal.' },
    ]

    const cases: any[] = []
    let caseNum = 1000
    for (const t of caseTemplates) {
        const lawyer = lawyers[t.lawyerIdx]
        const client = clients[t.clientIdx]
        const lc = await prisma.legalCase.create({
            data: {
                caseNumber: `BL-${++caseNum}`,
                title: t.title, description: t.desc,
                legalArea: t.area, status: t.status,
                clientId: client.id, lawyerId: lawyer.user.id,
                createdAt: new Date(Date.now() - Math.random() * 60 * 86400000),
            },
        })
        cases.push({ lc, ...t, lawyer, client })

        // Evento inicial
        await (prisma as any).caseEvent.create({ data: {
            id: cuid(), caseId: lc.id, userId: client.id,
            type: 'STATUS_CHANGE', description: 'Caso registrado en el sistema',
            toStatus: 'SOLICITUD', createdAt: new Date(lc.createdAt.getTime() + 1000),
        }})

        // Presupuesto para estados avanzados
        if (['PRESUPUESTO_ENVIADO','PRESUPUESTO_APROBADO','CONTRATO_FIRMADO','EN_CURSO','CERRADO'].includes(t.status)) {
            const amt = 500 + Math.floor(Math.random() * 2000)
            await prisma.budget.create({ data: {
                caseId: lc.id, amount: amt,
                description: `Honorarios profesionales por representación en ${t.title}. Incluye consultas, redacción de escritos y asistencia a audiencias.`,
                status: t.status === 'PRESUPUESTO_ENVIADO' ? 'PENDIENTE' : 'APROBADO',
                createdAt: new Date(lc.createdAt.getTime() + 86400000),
            }})
            await (prisma as any).caseEvent.create({ data: {
                id: cuid(), caseId: lc.id, userId: lawyer.user.id,
                type: 'BUDGET', description: `Presupuesto enviado por $${amt} USD`,
                createdAt: new Date(lc.createdAt.getTime() + 86400000 + 1000),
            }})
        }

        // Contrato para EN_CURSO y CERRADO
        if (['CONTRATO_FIRMADO','EN_CURSO','CERRADO'].includes(t.status)) {
            await prisma.serviceContract.create({ data: {
                caseId: lc.id,
                terms: `CONTRATO DE SERVICIOS PROFESIONALES\n\nEntre el profesional del derecho ${lawyer.user.name} y el cliente ${client.name}.\n\nOBJETO: Representación legal en el caso "${t.title}".\n\nHONORARIOS: Según presupuesto aprobado.\n\nDURACIÓN: Hasta la resolución definitiva del caso.\n\nJURISDICCIÓN: República Bolivariana de Venezuela.`,
                signedAt: new Date(lc.createdAt.getTime() + 3 * 86400000),
                signedBy: 'AMBOS',
                createdAt: new Date(lc.createdAt.getTime() + 2 * 86400000),
            }})
            await (prisma as any).caseEvent.create({ data: {
                id: cuid(), caseId: lc.id, userId: client.id,
                type: 'CONTRACT', description: 'Contrato firmado por ambas partes',
                fromStatus: 'PRESUPUESTO_APROBADO', toStatus: 'EN_CURSO',
                createdAt: new Date(lc.createdAt.getTime() + 3 * 86400000 + 1000),
            }})
        }

        // Pago para EN_CURSO
        if (t.status === 'EN_CURSO') {
            await (prisma as any).casePayment.create({ data: {
                id: cuid(), caseId: lc.id, clientId: client.id,
                amount: 300 + Math.floor(Math.random() * 500),
                currency: 'USD', method: ['ZELLE','TRANSFERENCIA','PAGO_MOVIL'][Math.floor(Math.random()*3)],
                reference: 'REF-' + Math.floor(Math.random() * 999999),
                concept: 'Adelanto de honorarios profesionales',
                status: 'CONFIRMADO', confirmedById: lawyer.user.id,
                confirmedAt: new Date(lc.createdAt.getTime() + 5 * 86400000),
                createdAt: new Date(lc.createdAt.getTime() + 4 * 86400000),
                updatedAt: new Date(lc.createdAt.getTime() + 5 * 86400000),
            }})
        }

        // Revisión para CERRADO
        if (t.status === 'CERRADO') {
            await prisma.review.create({ data: {
                caseId: lc.id, clientId: client.id, lawyerId: lawyer.user.id,
                rating: 4 + Math.floor(Math.random() * 2),
                comment: 'Excelente trabajo, muy profesional y dedicado. Resolvió mi caso de manera eficiente.',
            }})
        }
    }

    // ── Citas ─────────────────────────────────────────────────────────────────
    const citaStatuses = ['PENDIENTE','CONFIRMADA','FINALIZADA','CANCELADA']
    for (let i = 0; i < 30; i++) {
        const client = clients[i % 15]
        const lawyer = lawyers[i % 12]  // solo abogados aprobados
        const daysOffset = i < 10 ? i + 1 : -(i - 10) * 3
        await prisma.appointmentRequest.create({ data: {
            clientId: client.id, lawyerId: lawyer.user.id,
            serviceId: services[i % 6].id,
            message: `Necesito asesoría urgente sobre mi situación legal. ${['Es un caso urgente.','Tengo documentos de respaldo.','Fui recomendado por un amigo.','Vi su perfil y me parece el indicado.'][i % 4]}`,
            preferredDate: new Date(Date.now() + daysOffset * 86400000),
            legalArea: services[i % 6].legalArea,
            status: daysOffset < 0 ? 'FINALIZADA' : citaStatuses[i % 3],
        }})
    }

    // ── Blog posts ─────────────────────────────────────────────────────────────
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    const lawyerAuthors = [lawyers[0].user, lawyers[3].user, lawyers[7].user]
    const posts = [
        { title: 'Tus derechos ante un arresto en Venezuela: guía completa', area: 'PENAL', author: lawyerAuthors[0].id, days: 30,
          excerpt: 'Conoce los derechos que te protegen según el COPP al momento de ser detenido.',
          content: '<h2>¿Qué derechos tienes al ser detenido?</h2><p>En Venezuela, el COPP garantiza derechos fundamentales a toda persona detenida. Tienes derecho a conocer el motivo de tu detención, contactar a un abogado y no firmar documentos sin asesoría legal.</p><h2>Los 5 derechos clave</h2><ul><li>Derecho a ser informado del motivo</li><li>Derecho a silencio</li><li>Derecho a asistencia jurídica</li><li>Derecho a comunicarte con tu familia</li><li>Derecho a no ser torturado ni maltratado</li></ul><p>Ante cualquier detención, lo primero es mantener la calma y contactar a un abogado de confianza.</p>' },
        { title: 'Cómo constituir una empresa en Venezuela en 2026', area: 'CORPORATIVO', author: lawyerAuthors[1].id, days: 25,
          excerpt: 'Guía paso a paso para registrar tu empresa ante el Registro Mercantil en 2026.',
          content: '<h2>Pasos para constituir tu empresa</h2><ol><li>Reserva del nombre en el Registro Mercantil</li><li>Redacción del acta constitutiva</li><li>Firma ante notario público</li><li>Inscripción en el Registro Mercantil</li><li>Publicación en prensa</li><li>Obtención del RIF en SENIAT</li></ol><h2>Tiempos estimados</h2><p>El proceso completo toma entre 20 y 45 días hábiles dependiendo del Registro Mercantil de tu ciudad.</p>' },
        { title: 'Manutención de hijos en Venezuela: cuánto y cómo se calcula', area: 'LOPNA', author: admin!.id, days: 20,
          excerpt: 'Todo sobre la obligación de manutención según la LOPNA y cómo calcularla.',
          content: '<h2>La obligación de manutención</h2><p>Según la LOPNA, ambos padres tienen la obligación irrenunciable de mantener a sus hijos. El monto lo fija el Tribunal considerando los ingresos del obligado y las necesidades del menor.</p><h2>¿Cómo se calcula?</h2><p>Se toma como referencia el CESTA TICKET y el salario mínimo nacional. Para trabajadores con ingresos en divisas, el tribunal puede fijar la manutención en moneda extranjera.</p>' },
        { title: 'El despido injustificado en Venezuela: qué hacer y cómo reclamar', area: 'CIVIL', author: lawyerAuthors[0].id, days: 15,
          excerpt: 'Si te despidieron sin causa, tienes derechos. Aprende cómo reclamarlos según la LOTTT.',
          content: '<h2>¿Qué es el despido injustificado?</h2><p>Es la terminación de la relación laboral sin que exista una causa prevista en la LOTTT. El trabajador tiene derecho a prestaciones sociales, indemnización adicional y otros beneficios.</p><h2>Pasos a seguir</h2><ol><li>Documentar todo: guardar contratos, comprobantes de pago y comunicaciones</li><li>Acudir a la Inspectoría del Trabajo en los primeros 30 días</li><li>Solicitar la reenganche o el pago de indemnizaciones</li></ol>' },
        { title: 'Amparo constitucional: el recurso más rápido para proteger tus derechos', area: 'PENAL', author: lawyerAuthors[1].id, days: 10,
          excerpt: 'El amparo constitucional puede resolver tu situación en horas. Conoce cuándo procede.',
          content: '<h2>¿Qué es el amparo?</h2><p>Es la acción judicial más rápida para proteger derechos constitucionales violados. Debe tramitarse ante el Tribunal competente según el acto lesivo.</p><h2>Hábeas Corpus</h2><p>La modalidad especial del amparo para proteger la libertad personal. Es prioritario y debe resolverse en 96 horas.</p>' },
        { title: 'Cheque sin fondos en Venezuela: proceso penal y civil', area: 'CIVIL', author: admin!.id, days: 5,
          excerpt: 'Emitir un cheque sin fondos en Venezuela tiene consecuencias penales y civiles graves.',
          content: '<h2>El cheque sin fondos</h2><p>En Venezuela, emitir un cheque sin provisión de fondos puede configurar el delito de estafa según el Código Penal. La víctima puede ejercer la acción penal simultáneamente con el cobro civil.</p><h2>¿Qué hacer si te dieron un cheque sin fondos?</h2><ol><li>Solicita la constancia del banco</li><li>Notifica al librador mediante telegrama</li><li>Acude ante el Ministerio Público o ejerce acción civil</li></ol>' },
    ]
    for (const p of posts) {
        const s = slug(p.title)
        const exists = await prisma.blogPost.findUnique({ where: { slug: s } })
        if (!exists) {
            await prisma.blogPost.create({ data: {
                title: p.title, slug: s, content: p.content, excerpt: p.excerpt,
                legalArea: p.area, authorId: p.author, published: true,
                publishedAt: new Date(Date.now() - p.days * 86400000),
            }})
        }
    }

    // ── Testimonios ────────────────────────────────────────────────────────────
    const testimonialCount = await prisma.testimonial.count()
    if (testimonialCount === 0) {
        await prisma.testimonial.createMany({ data: [
            { name: 'Pedro Martínez', role: 'Cliente - Caso Penal', content: 'La Dra. Rodríguez me sacó de una situación muy difícil. Profesional y humana a la vez. La recomiendo sin dudarlo.', rating: 5, active: true },
            { name: 'María González', role: 'Empresaria - Derecho Corporativo', content: 'Constituyeron mi empresa en tiempo récord. El Dr. Torres conoce cada detalle del derecho mercantil venezolano.', rating: 5, active: true },
            { name: 'Carmen Villalobos', role: 'Cliente - Familia LOPNA', content: 'Gracias a BufeteLegal obtuve la custodia de mis hijos. El proceso fue duro pero el equipo siempre estuvo conmigo.', rating: 5, active: true },
            { name: 'Jorge Medina', role: 'Trabajador - Caso Laboral', content: 'Recuperé 18 años de prestaciones que la empresa quería no pagarme. Excelente trabajo.', rating: 5, active: true },
            { name: 'Sofía Núñez', role: 'Cliente - Derecho Civil', content: 'Mi caso de cobro de deuda parecía imposible. El abogado logró el pago total en 3 meses.', rating: 4, active: true },
            { name: 'Diego Reyes', role: 'Empresario - Derecho Corporativo', content: 'La fusión de mis dos empresas fue compleja pero el equipo la manejó con total profesionalismo.', rating: 5, active: true },
        ]})
    }

    // ── Tickets de soporte ─────────────────────────────────────────────────────
    const ticketData = [
        { userId: clients[0].id, subject: 'No puedo acceder a mi expediente', message: 'Intento ver mi caso BL-1001 y me dice que no tengo acceso. Por favor revisar.', status: 'CERRADO', response: 'Hemos verificado su acceso y corregido el problema. Ya puede visualizar su expediente normalmente.' },
        { userId: clients[2].id, subject: 'Error al firmar el contrato digitalmente', message: 'La firma digital no funciona en mi teléfono móvil. Uso un Samsung Galaxy S21.', status: 'EN_PROCESO', response: 'Estamos investigando el problema con dispositivos Android. Le contactaremos en 24 horas.' },
        { userId: clients[5].id, subject: 'Quiero cambiar de abogado asignado', message: 'No estoy conforme con la atención recibida y quisiera solicitar un cambio de representante.', status: 'ABIERTO', response: null },
        { userId: clients[8].id, subject: 'Problema con el pago móvil registrado', message: 'Registré un pago móvil hace 3 días y aún aparece como pendiente.', status: 'CERRADO', response: 'El pago fue confirmado manualmente. El retraso se debió a mantenimiento bancario. Disculpe las molestias.' },
        { userId: clients[10].id, subject: '¿Cuánto tiempo tarda el proceso?', message: 'Quisiera saber un estimado de tiempo para resolver mi caso de cobro de cheque sin fondos.', status: 'CERRADO', response: 'Los procesos de cheque sin fondos toman entre 3 y 8 meses en Venezuela dependiendo del tribunal.' },
    ]
    for (const t of ticketData) {
        await prisma.supportTicket.create({ data: {
            userId: t.userId, subject: t.subject, message: t.message,
            status: t.status, response: t.response,
        }})
    }

    // ── Notificaciones ─────────────────────────────────────────────────────────
    for (let i = 0; i < 10; i++) {
        const u = i % 2 === 0 ? clients[i % 15] : lawyers[i % 12].user
        await prisma.notification.create({ data: {
            userId: u.id,
            title: ['Nuevo mensaje de su abogado','Presupuesto enviado','Cita confirmada','Caso actualizado','Pago confirmado'][i % 5],
            body: ['Su abogado le ha enviado un mensaje importante.','Revise el presupuesto enviado para su caso.','Su cita ha sido confirmada para mañana.','Su caso ha sido actualizado con nueva información.','Su pago ha sido confirmado por el abogado.'][i % 5],
            type: ['MENSAJE','PRESUPUESTO','CASO','CASO','CASO'][i % 5],
            read: i > 5,
        }})
    }

    console.log(`Seed masivo completado:
- 20 abogados (15 aprobados, 3 pendientes, 2 rechazados)
- 15 clientes con emails reales
- 18 casos en todos los estados
- 30 citas (pasadas, futuras, canceladas)
- 6 artículos de blog publicados
- 6 testimonios
- 5 tickets de soporte
- Pagos, contratos, presupuestos y eventos de caso`)
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
