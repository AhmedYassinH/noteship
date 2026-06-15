#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="${1:-noteship.ahmedyassin.dev}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${2:-$REPO_ROOT/certs/local}"

mkdir -p "$OUT_DIR"

is_wsl() {
  [[ "$(uname -s)" == "Linux" ]] && grep -qi microsoft /proc/version 2>/dev/null
}

is_windows_bash() {
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) return 0 ;;
    *) return 1 ;;
  esac
}

NODE_BIN="${NODE_BIN:-}"
NODE_OUT_DIR="$OUT_DIR"

if [[ -z "$NODE_BIN" ]]; then
  if is_wsl; then
    if command -v node >/dev/null 2>&1; then
      NODE_BIN="node"
    elif command -v node.exe >/dev/null 2>&1 && command -v wslpath >/dev/null 2>&1; then
      NODE_BIN="node.exe"
      NODE_OUT_DIR="$(wslpath -w "$OUT_DIR")"
    elif command -v powershell.exe >/dev/null 2>&1 && command -v wslpath >/dev/null 2>&1; then
      NODE_BIN_WIN="$(powershell.exe -NoProfile -Command "(Get-Command node).Source" | tr -d '\r')"
      NODE_BIN="$(wslpath "$NODE_BIN_WIN")"
      NODE_OUT_DIR="$(wslpath -w "$OUT_DIR")"
    else
      echo "Node.js is required to generate the local certificate."
      exit 1
    fi
  elif is_windows_bash; then
    if command -v node >/dev/null 2>&1; then
      NODE_BIN="node"
    elif command -v node.exe >/dev/null 2>&1; then
      NODE_BIN="node.exe"
    elif command -v powershell.exe >/dev/null 2>&1 && command -v cygpath >/dev/null 2>&1; then
      NODE_BIN_WIN="$(powershell.exe -NoProfile -Command "(Get-Command node).Source" | tr -d '\r')"
      NODE_BIN="$(cygpath -u "$NODE_BIN_WIN")"
    else
      echo "Node.js is required to generate the local certificate."
      exit 1
    fi

    if command -v cygpath >/dev/null 2>&1; then
      NODE_OUT_DIR="$(cygpath -w "$OUT_DIR")"
    fi
  elif command -v node >/dev/null 2>&1; then
    NODE_BIN="node"
  else
    echo "Node.js is required to generate the local certificate."
    exit 1
  fi
fi

"$NODE_BIN" - "$HOST_NAME" "$NODE_OUT_DIR" <<'NODE'
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const [, , hostName, outDir] = process.argv;

const derLength = (length) => {
  if (length < 0x80) return Buffer.from([length]);
  const bytes = [];
  let value = length;
  while (value > 0) {
    bytes.unshift(value & 0xff);
    value >>= 8;
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
};

const tlv = (tag, value) => Buffer.concat([Buffer.from([tag]), derLength(value.length), value]);
const sequence = (...items) => tlv(0x30, Buffer.concat(items));
const set = (...items) => tlv(0x31, Buffer.concat(items));
const explicit = (tag, value) => tlv(0xa0 + tag, value);
const oid = (value) => {
  const parts = value.split(".").map(Number);
  const bytes = [40 * parts[0] + parts[1]];
  for (const part of parts.slice(2)) {
    const encoded = [part & 0x7f];
    let current = part >> 7;
    while (current > 0) {
      encoded.unshift((current & 0x7f) | 0x80);
      current >>= 7;
    }
    bytes.push(...encoded);
  }
  return tlv(0x06, Buffer.from(bytes));
};
const nullValue = () => Buffer.from([0x05, 0x00]);
const utf8 = (value) => tlv(0x0c, Buffer.from(value, "utf8"));
const printable = (value) => tlv(0x13, Buffer.from(value, "ascii"));
const integer = (value) => {
  let bytes;
  if (typeof value === "number") {
    bytes = [];
    let current = value;
    do {
      bytes.unshift(current & 0xff);
      current >>= 8;
    } while (current > 0);
    bytes = Buffer.from(bytes);
  } else {
    bytes = Buffer.from(value);
  }
  while (bytes.length > 1 && bytes[0] === 0x00 && bytes[1] < 0x80) {
    bytes = bytes.subarray(1);
  }
  if (bytes[0] & 0x80) bytes = Buffer.concat([Buffer.from([0x00]), bytes]);
  return tlv(0x02, bytes);
};
const bitString = (value) => tlv(0x03, Buffer.concat([Buffer.from([0x00]), value]));
const octetString = (value) => tlv(0x04, value);
const utcTime = (date) => {
  const year = String(date.getUTCFullYear()).slice(-2);
  const pad = (value) => String(value).padStart(2, "0");
  return tlv(
    0x17,
    Buffer.from(
      `${year}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(
        date.getUTCHours(),
      )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`,
      "ascii",
    ),
  );
};
const contextPrimitive = (tag, value) =>
  tlv(0x80 + tag, Buffer.isBuffer(value) ? value : Buffer.from(value, "ascii"));

const algorithmIdentifier = sequence(oid("1.2.840.113549.1.1.11"), nullValue());
const name = sequence(set(sequence(oid("2.5.4.3"), utf8(hostName))));
const now = new Date();
const notBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const notAfter = new Date(now);
notAfter.setUTCFullYear(notAfter.getUTCFullYear() + 1);

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicExponent: 0x10001,
});

const serial = crypto.randomBytes(16);
serial[0] &= 0x7f;

const subjectPublicKeyInfo = publicKey.export({ type: "spki", format: "der" });
const san = sequence(
  contextPrimitive(2, hostName),
  contextPrimitive(2, "localhost"),
  contextPrimitive(7, Buffer.from([127, 0, 0, 1])),
);
const extensions = explicit(
  3,
  sequence(
    sequence(oid("2.5.29.19"), Buffer.from([0x01, 0x01, 0xff]), octetString(sequence())),
    sequence(oid("2.5.29.15"), Buffer.from([0x01, 0x01, 0xff]), octetString(bitString(Buffer.from([0xa0])))),
    sequence(oid("2.5.29.37"), octetString(sequence(oid("1.3.6.1.5.5.7.3.1")))),
    sequence(oid("2.5.29.17"), octetString(san)),
  ),
);

const tbsCertificate = sequence(
  explicit(0, integer(2)),
  integer(serial),
  algorithmIdentifier,
  name,
  sequence(utcTime(notBefore), utcTime(notAfter)),
  name,
  subjectPublicKeyInfo,
  extensions,
);

const signature = crypto.sign("sha256", tbsCertificate, privateKey);
const certificateDer = sequence(tbsCertificate, algorithmIdentifier, bitString(signature));

const pem = (label, der) => {
  const body = Buffer.from(der).toString("base64").match(/.{1,64}/g).join("\n");
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----\n`;
};

fs.writeFileSync(path.join(outDir, `${hostName}.crt`), pem("CERTIFICATE", certificateDer));
fs.writeFileSync(
  path.join(outDir, `${hostName}.key`),
  privateKey.export({ type: "pkcs1", format: "pem" }),
);

console.log(`Generated ${path.join(outDir, `${hostName}.crt`)}`);
console.log(`Generated ${path.join(outDir, `${hostName}.key`)}`);
NODE
