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
│       ├── config/                 # Configuración + Prisma client
│       ├── middleware/             # auth, roles, errorHandler
│       ├── routes/                 # auth, public, client, lawyer, admin
│       └── validators/            # Schemas Zod
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing Page
│       │   ├── abogados/          # Listado + Perfil
│       │   ├── login/             # Login
│       │   ├── registro/          # Registro
│       │   └── dashboard/         # Dashboard por rol
│       │       ├── citas/         # Cliente: mis citas
│       │       ├── perfil/        # Cliente: mi perfil
│       │       ├── mis-citas/     # Abogado: solicitudes
│       │       ├── mi-perfil/     # Abogado: perfil profesional
│       │       └── admin/         # Admin: CRUD completo
│       ├── components/            # Navbar, Footer
│       ├── contexts/              # AuthContext
│       └── lib/                   # API fetch wrapper
```

## 🔐 Roles y Permisos

- **CLIENTE**: Crear solicitudes, ver historial, editar perfil
- **ABOGADO**: Ver solicitudes asignadas, cambiar estados, editar perfil profesional
- **ADMIN**: CRUD completo de usuarios, abogados, servicios, testimonios, citas + métricas

## 🎨 Paleta de Colores

- **Primario**: Navy Blue (#1E3A5F)
- **Acento**: Gold (#D4A847)
- **Fondo**: White/Light Gray (#F8F9FA)
