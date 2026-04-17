# Guía de Despliegue - BufeteLegal

Este proyecto está preparado para ser desplegado de forma gratuita en la web.

## 1. Backend (Servidor) - Render.com

1. Sube el código a GitHub.
2. Crea un **Web Service** en Render.
3. Carpeta raíz: `backend`.
4. Build Command: `npm install && npm run build`.
5. Start Command: `npm start`.
6. Variables de Entorno (.env):
   - `DATABASE_URL`: (Tu URL de base de datos de Neon.tech o Supabase).
   - `JWT_SECRET`: Una palabra secreta larga.
   - `JWT_REFRESH_SECRET`: Otra palabra secreta larga.
   - `NODE_ENV`: `production`.
   - `CORS_ORIGIN`: Tu URL de Vercel (ej: `https://bufete-legal.vercel.app`).
   - `PORT`: `4000`.

## 2. Frontend (Interfaz) - Vercel.com

1. Conecta tu GitHub a Vercel.
2. Selecciona la carpeta `frontend`.
3. Framework Preset: **Next.js**.
4. Variables de Entorno:
   - `NEXT_PUBLIC_API_URL`: Tu URL de Render + `/api` (ej: `https://tu-backend.onrender.com/api`).

## 3. Base de Datos - Neon.tech

1. Crea un proyecto en Neon.tech.
2. Copia la **Connection String**.
3. Pégala en la variable `DATABASE_URL` de Render.
4. Para cargar los datos iniciales, ejecuta `npx prisma migrate deploy` y `npx prisma db seed` desde el panel de Render o tu terminal local apuntando a la nueva URL.
