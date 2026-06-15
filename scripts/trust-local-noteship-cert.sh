#!/usr/bin/env bash
set -euo pipefail

CERT_PATH="${1:-certs/local/noteship.ahmedyassin.dev.crt}"

if [[ ! -f "$CERT_PATH" ]]; then
  echo "Certificate not found: $CERT_PATH"
  exit 1
fi

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    powershell.exe -NoProfile -ExecutionPolicy Bypass \
      -Command "Import-Certificate -FilePath '$(cygpath -w "$CERT_PATH")' -CertStoreLocation 'Cert:\\CurrentUser\\Root' | Out-Null"
    ;;
  Linux)
    if grep -qi microsoft /proc/version 2>/dev/null && command -v powershell.exe >/dev/null 2>&1 && command -v wslpath >/dev/null 2>&1; then
      powershell.exe -NoProfile -ExecutionPolicy Bypass \
        -Command "Import-Certificate -FilePath '$(wslpath -w "$CERT_PATH")' -CertStoreLocation 'Cert:\\CurrentUser\\Root' | Out-Null"
    else
      echo "Linux trust stores vary by distro."
      echo "For Debian/Ubuntu, copy this cert to /usr/local/share/ca-certificates/ and run update-ca-certificates."
      echo "Certificate: $CERT_PATH"
      exit 1
    fi
    ;;
  Darwin)
    security add-trusted-cert -d -r trustRoot -k "$HOME/Library/Keychains/login.keychain-db" "$CERT_PATH"
    ;;
  *)
    echo "Unsupported OS for automatic trust installation: $(uname -s)"
    exit 1
    ;;
esac

echo "Trusted local Noteship certificate."
