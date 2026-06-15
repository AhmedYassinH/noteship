#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="${1:-noteship.ahmedyassin.dev}"
PORT="${2:-3000}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$REPO_ROOT/apps/web"
CERT_PATH="$REPO_ROOT/certs/local/noteship.ahmedyassin.dev.crt"
KEY_PATH="$REPO_ROOT/certs/local/noteship.ahmedyassin.dev.key"

if [[ ! -f "$CERT_PATH" ]]; then
  echo "Certificate not found: $CERT_PATH"
  exit 1
fi

if [[ ! -f "$KEY_PATH" ]]; then
  echo "Private key not found: $KEY_PATH"
  exit 1
fi

if [[ "$(uname -s)" == "Linux" ]] && grep -qi microsoft /proc/version 2>/dev/null; then
  if ! command -v powershell.exe >/dev/null 2>&1 || ! command -v wslpath >/dev/null 2>&1; then
    echo "WSL detected, but powershell.exe/wslpath is not available."
    exit 1
  fi

  WEB_DIR_WIN="$(wslpath -w "$WEB_DIR")"
  CERT_PATH_WIN="$(wslpath -w "$CERT_PATH")"
  KEY_PATH_WIN="$(wslpath -w "$KEY_PATH")"

  exec powershell.exe -NoProfile -ExecutionPolicy Bypass -Command \
    "Set-Location -LiteralPath '$WEB_DIR_WIN'; pnpm.cmd exec next dev --hostname '$HOST_NAME' --port '$PORT' --experimental-https --experimental-https-cert '$CERT_PATH_WIN' --experimental-https-key '$KEY_PATH_WIN'"
fi

cd "$WEB_DIR"
PNPM_BIN="${PNPM_BIN:-}"
if [[ -z "$PNPM_BIN" ]]; then
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_BIN="pnpm"
  elif command -v pnpm.cmd >/dev/null 2>&1; then
    PNPM_BIN="pnpm.cmd"
  else
    echo "pnpm is required to start the local HTTPS web server."
    exit 1
  fi
fi

exec "$PNPM_BIN" exec next dev \
  --hostname "$HOST_NAME" \
  --port "$PORT" \
  --experimental-https \
  --experimental-https-cert "$CERT_PATH" \
  --experimental-https-key "$KEY_PATH"
