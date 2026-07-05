#!/usr/bin/env bash
# Daily Postgres backup. Add to cron (see DEPLOY.md). Keeps the last 7 days.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/edubridge-backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

# Dump from the running postgres container into a gzipped file.
docker exec -t edubridge-postgres-1 \
  pg_dump -U "${POSTGRES_USER:-edubridge}" "${POSTGRES_DB:-edubridge}" \
  | gzip > "$BACKUP_DIR/edubridge-$STAMP.sql.gz"

# Prune old backups.
find "$BACKUP_DIR" -name 'edubridge-*.sql.gz' -mtime "+$KEEP_DAYS" -delete

echo "Backup written to $BACKUP_DIR/edubridge-$STAMP.sql.gz"
