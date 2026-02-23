#!/bin/sh
set -e

echo "==> Starting Next.js server..."
echo "    NOTE: Run migrations from host with:"
echo "    DATABASE_URL=postgresql://postgres:postgres@localhost:5433/plant_organizer npx prisma migrate deploy"
exec node server.js
