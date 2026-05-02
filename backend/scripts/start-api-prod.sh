#!/bin/sh
set -eu

# Run DB migrations, then start the API (single deploy entrypoint).
cd "$(dirname "$0")/.." || exit 1

node scripts/migrate-prod.cjs
exec node dist/main
