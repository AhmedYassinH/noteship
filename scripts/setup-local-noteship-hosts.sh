#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="${1:-noteship.ahmedyassin.dev}"
ADDRESS="${2:-127.0.0.1}"

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    HOSTS_FILE="/c/Windows/System32/drivers/etc/hosts"
    ;;
  Linux)
    if grep -qi microsoft /proc/version 2>/dev/null && command -v wslpath >/dev/null 2>&1; then
      HOSTS_FILE="$(wslpath "C:\\Windows\\System32\\drivers\\etc\\hosts")"
    elif [[ -f "/mnt/c/Windows/System32/drivers/etc/hosts" ]]; then
      HOSTS_FILE="/mnt/c/Windows/System32/drivers/etc/hosts"
    else
      HOSTS_FILE="/etc/hosts"
    fi
    ;;
  *)
    HOSTS_FILE="/etc/hosts"
    ;;
esac

if [[ ! -w "$HOSTS_FILE" ]]; then
  echo "Cannot write to $HOSTS_FILE."
  echo "Re-run this script from an elevated/admin shell, or with sudo on macOS/Linux."
  exit 1
fi

if grep -Eq "^[[:space:]]*${ADDRESS//./\\.}[[:space:]]+${HOST_NAME//./\\.}([[:space:]]|$)" "$HOSTS_FILE"; then
  echo "$HOST_NAME already points to $ADDRESS in $HOSTS_FILE"
  exit 0
fi

printf "\n%s %s # Noteship local HTTPS\n" "$ADDRESS" "$HOST_NAME" >> "$HOSTS_FILE"
echo "Added hosts entry: $ADDRESS $HOST_NAME"
