// Force deterministic auth behavior in the test suite regardless of the local
// .env (which may enable AUTO_VERIFY_EMAIL for dev convenience). Set before the
// Nest app boots so ConfigModule/dotenv won't override it.
process.env.AUTO_VERIFY_EMAIL = 'false';

// Route e2e tests to a dedicated test database so runs never touch dev data.
// - If TEST_DATABASE_URL is set, use it.
// - Else if DATABASE_URL already points at a *_test database (e.g. CI), keep it.
// - Otherwise swap the database name to `edubridge_test`.
function resolveTestDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = process.env.DATABASE_URL ?? '';
  if (/_test(\?|$)/.test(url)) return url;
  if (url) {
    const swapped = url.replace(/\/([^/?]+)(\?|$)/, '/edubridge_test$2');
    if (swapped !== url) return swapped;
  }
  return 'postgresql://edubridge:edubridge@localhost:5432/edubridge_test?schema=public';
}

process.env.DATABASE_URL = resolveTestDatabaseUrl();
