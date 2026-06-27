#!/usr/bin/env bash
# Ensure the dedicated e2e test database exists and is migrated.
# Safe & idempotent: creates the DB only if missing, then applies migrations.
set -euo pipefail

TEST_URL="${TEST_DATABASE_URL:-postgresql://edubridge:edubridge@localhost:5432/edubridge_test?schema=public}"

# Derive the admin connection (the default `postgres` db) and the target db name.
NO_QUERY="${TEST_URL%%\?*}"
DB_NAME="${NO_QUERY##*/}"
ADMIN_URL="${NO_QUERY%/*}/postgres"

# Create the database if it does not exist (best-effort; needs the psql client).
if command -v psql >/dev/null 2>&1; then
  if ! psql "$ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null | grep -q 1; then
    psql "$ADMIN_URL" -c "CREATE DATABASE \"${DB_NAME}\"" >/dev/null 2>&1 || true
    echo "created database ${DB_NAME}"
  fi
else
  echo "psql not found — assuming ${DB_NAME} already exists"
fi

echo "migrating ${DB_NAME}…"
DATABASE_URL="$TEST_URL" npx prisma migrate deploy
