#!/bin/sh
# Post-startup setup: pull Ollama model and seed database
# Run this after `docker compose up` once all services are healthy.
#
# Usage: ./scripts/setup.sh

set -e

echo "==> Pulling Ollama model (qwen2.5)..."
echo "    This may take a few minutes on first run."
docker compose exec ollama ollama pull qwen2.5

echo ""
echo "==> Running database migrations..."
docker compose exec app npx prisma migrate deploy

echo ""
echo "==> Seeding database..."
docker compose exec app npx tsx prisma/seed.ts 2>/dev/null || \
  echo "    (seed skipped — run manually if needed: docker compose exec app npx tsx prisma/seed.ts)"

echo ""
echo "==> Setup complete!"
echo "    App:    http://localhost:3000"
echo "    Ollama: http://localhost:11434"
echo "    DB:     postgresql://postgres:postgres@localhost:5432/plant_organizer"
