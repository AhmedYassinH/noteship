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
Write-Host "  1. Load env vars from .env.local (see command below)"
Write-Host "  2. Install deps: pnpm install"
Write-Host "  3. Run API: pnpm --filter @noteship/api dev"
Write-Host "  4. Run Web: pnpm --filter @noteship/web dev"
Write-Host ""
Write-Host "API will run on http://localhost:3001"
Write-Host "Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 in apps/web/.env.local"
Write-Host ""
Write-Host "Load .env.local:"
Write-Host '  Get-Content .env.local | ForEach-Object { if ($_ -match "^([^#].+?)=(.+)$") { [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }'
Write-Host ""
Write-Host "To stop emulators: docker compose -f docker-compose.local.yml down"
