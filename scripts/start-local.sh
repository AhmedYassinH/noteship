#!/usr/bin/env bash
set -e

echo "Starting local emulators..."
docker compose -f docker-compose.local.yml up -d

echo "Waiting for services to be healthy..."
sleep 10

echo "Initializing local resources..."
npx tsx scripts/init-local.ts

echo ""
echo "Local environment ready!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.local values to .env or export them"
echo "  2. Run: pnpm --filter @noteship/api build"
echo "  3. Run: pnpm --filter @noteship/web dev"
echo ""
echo "To stop emulators: docker compose -f docker-compose.local.yml down"
