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
echo "  1. Load env vars: source .env.local (or copy values to .env)"
echo "  2. Install deps: pnpm install"
echo "  3. Run API: pnpm --filter @noteship/api dev"
echo "  4. Run Web: pnpm --filter @noteship/web dev"
echo ""
echo "API will run on http://localhost:3001"
echo "Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 in apps/web/.env.local"
echo ""
echo "To stop emulators: docker compose -f docker-compose.local.yml down"
