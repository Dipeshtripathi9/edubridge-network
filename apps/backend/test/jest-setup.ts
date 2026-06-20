// Force deterministic auth behavior in the test suite regardless of the local
// .env (which may enable AUTO_VERIFY_EMAIL for dev convenience). Set before the
// Nest app boots so ConfigModule/dotenv won't override it.
process.env.AUTO_VERIFY_EMAIL = 'false';
