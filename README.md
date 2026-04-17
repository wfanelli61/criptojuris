# ⚖️ BufeteLegal - Sistema de Gestión de Abogados

Sistema web completo para gestión de un bufete de abogados con Landing Page pública y Dashboard privado por roles.

## 🏗️ Stack

| Tecnología | Uso |
|---|---|
| **Next.js 15** (App Router) | Frontend |
| **Express + TypeScript** | Backend API |
| **PostgreSQL 16** | Base de datos |
| **Prisma** | ORM |
| **JWT + Refresh Token** | Autenticación |
| **Tailwind CSS 4** | Estilos |
| **Zod** | Validación |
| **Socket.io** | Chat en tiempo real |
| **Docker Compose** | PostgreSQL |

## 🚀 Inicio Rápido

### 1. Clonar y configurar variables de entorno

```bash
cp .env.example .env
# Editar .env si es necesario
```

### 2. Levantar PostgreSQL con Docker

```bash
docker-compose up -d
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Configurar base de datos

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Ejecutar el proyecto

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# ✅ Backend en http://localhost:4000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# ✅ Frontend en http://localhost:3000
```

## 👤 Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@bufete.com | 123456 |
| Abogado | carlos.martinez@bufete.com | 123456 |
| Abogado | maria.rodriguez@bufete.com | 123456 |
| Cliente | pedro.garcia@email.com | 123456 |
| Cliente | lucia.morales@email.com | 123456 |

## 📂 Estructura

```
├── docker-compose.yml
├── .env
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos de datos
│   │   └── seed.ts                # Datos de prueba
│   └── src/
│       ├── index.ts               # Servidor Express
│       ├── socket.ts              # Socket.io (chat en tiempo real)
│       ├── config/                 # Configuración + Prisma client
│       ├── middleware/             # auth, roles, errorHandler
│       ├── routes/                 # auth, public, client, lawyer, admin, verification, chat
│       └── validators/            # Schemas Zod
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing Page
│       │   ├── abogados/          # Listado + Perfil público
│       │   ├── login/             # Login
│       │   ├── registro/          # Registro (Cliente o Abogado)
│       │   ├── para-abogados/     # Página de captación de abogados
│       │   ├── verificar/         # Verificación de email
│       │   └── dashboard/         # Dashboard por rol
│       │       ├── page.tsx       # Home dinámico con métricas
│       │       ├── citas/         # Cliente: mis citas
│       │       ├── perfil/        # Cliente: mi perfil
│       │       ├── mis-citas/     # Abogado: citas asignadas
│       │       ├── mi-perfil/     # Abogado: perfil profesional
│       │       ├── verificacion/  # Abogado: formulario de verificación
│       │       ├── chat/          # Chat en tiempo real
│       │       └── admin/         # Admin: CRUD completo
│       │           ├── usuarios/
│       │           ├── abogados/
│       │           ├── verificaciones/
│       │           ├── servicios/
│       │           ├── testimonios/
│       │           └── citas/
│       ├── components/            # Navbar, Footer, Calendar, AIChatWidget
│       ├── contexts/              # AuthContext, SocketContext
│       ├── hooks/                 # useSocket
│       └── lib/                   # API fetch wrapper, theme
```

## 🔐 Roles y Permisos

- **CLIENTE**: Crear solicitudes de cita, ver historial, editar perfil, chatear con abogados
- **ABOGADO**: Ver solicitudes asignadas, cambiar estados, editar perfil profesional, verificación
- **ADMIN**: CRUD completo de usuarios, abogados, servicios, testimonios, citas, verificaciones + métricas

## 🔄 Flujo de Verificación de Abogados

1. Abogado se registra → Se crea perfil con estado `NONE`
2. Abogado completa formulario de verificación (6 pasos) → Estado cambia a `PENDING`
3. Admin revisa la solicitud en `/dashboard/admin/verificaciones`
4. Admin aprueba o rechaza → Estado cambia a `APPROVED` o `REJECTED`
5. Abogado aprobado aparece en el listado público

## 🎨 Paleta de Colores

- **Primario**: Navy Blue (#1E3A5F)
- **Acento**: Gold (#D4A847)
- **Fondo**: White/Light Gray (#F8F9FA)

## 📡 API Endpoints

### Públicos
- `GET /api/public/services` — Servicios activos
- `GET /api/public/testimonials` — Testimonios aprobados
- `GET /api/public/lawyers` — Abogados verificados

### Auth
- `POST /api/auth/register` — Registro
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Usuario actual

### Cliente
- `GET/PUT /api/clients/me` — Perfil
- `GET/POST /api/clients/me/appointments` — Citas

### Abogado
- `GET/PUT /api/lawyers/me/profile` — Perfil
- `GET /api/lawyers/me/appointments` — Citas
- `PUT /api/lawyers/me/appointments/:id/status` — Cambiar estado

### Admin
- CRUD: `/api/admin/users`, `/api/admin/lawyers`, `/api/admin/services`, `/api/admin/testimonials`, `/api/admin/appointments`
- Verificaciones: `/api/admin/verifications`
- Métricas: `/api/admin/metrics`

### Chat
- `GET/POST /api/chat/conversations` — Conversaciones
- `GET /api/chat/conversations/:id/messages` — Mensajes
- `POST /api/chat/conversations/:id/upload` — Subir archivo
