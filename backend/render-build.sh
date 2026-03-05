#!/usr/bin/env bash
set -e

echo "=== Installing dependencies (including dev for TypeScript) ==="
npm install --include=dev

echo "=== Generating Prisma Client ==="
npx prisma generate

echo "=== Running database migrations ==="
npx prisma migrate deploy

echo "=== Building TypeScript ==="
npm run build

echo "=== Build complete! ==="
