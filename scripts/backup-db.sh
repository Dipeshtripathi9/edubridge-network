#!/usr/bin/env bash
# Back up the EduBridge PostgreSQL database to ./backups/.
# Usage: ./scripts/backup-db.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Load DATABASE_URL from the root .env
set -a; . ./.env; set +a

# pg_dump doesn't understand Prisma's ?schema=... param — strip the query string.
CLEAN_URL="${DATABASE_URL%%\?*}"

mkdir -p backups
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="backups/edubridge_${STAMP}.dump"

# Compressed, custom-format dump (restore with pg_restore).
pg_dump "$CLEAN_URL" -Fc -f "$OUT"
echo "✓ Backup written: $OUT ($(du -h "$OUT" | cut -f1))"

# Keep only the 14 most recent backups.
ls -1t backups/edubridge_*.dump 2>/dev/null | tail -n +15 | xargs -r rm -f
