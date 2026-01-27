Write-Host "Starting local emulators..."
docker compose -f docker-compose.local.yml up -d

Write-Host "Waiting for services to be healthy..."
Start-Sleep -Seconds 10

Write-Host "Initializing local resources..."
npx tsx scripts/init-local.ts

Write-Host ""
Write-Host "Local environment ready!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Copy .env.local values to .env or set them in your shell"
Write-Host "  2. Run: pnpm --filter @noteship/api build"
Write-Host "  3. Run: pnpm --filter @noteship/web dev"
Write-Host ""
Write-Host "To stop emulators: docker compose -f docker-compose.local.yml down"
