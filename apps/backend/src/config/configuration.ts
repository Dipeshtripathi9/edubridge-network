const DEV_ACCESS_SECRET = 'dev-access-secret-change-me';
const DEV_REFRESH_SECRET = 'dev-refresh-secret-change-me';

/**
 * Fail fast in production rather than boot with insecure defaults. A missing or
 * placeholder JWT secret would let anyone forge tokens for any user/role, and a
 * missing DATABASE_URL means a half-configured app. Dev keeps the fallbacks so
 * local setup stays zero-config.
 */
function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;
  const problems: string[] = [];
  const access = process.env.JWT_ACCESS_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;
  if (!access || access === DEV_ACCESS_SECRET) problems.push('JWT_ACCESS_SECRET');
  if (!refresh || refresh === DEV_REFRESH_SECRET) problems.push('JWT_REFRESH_SECRET');
  if (access && refresh && access === refresh) problems.push('JWT secrets must differ');
  if (!process.env.DATABASE_URL) problems.push('DATABASE_URL');
  if (problems.length) {
    throw new Error(
      `Refusing to start in production with insecure/missing config: ${problems.join(', ')}. ` +
        'Set strong, unique secrets and a database URL.',
    );
  }
}

export default () => {
  assertProductionConfig();
  return {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  globalPrefix: process.env.API_GLOBAL_PREFIX ?? 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
  // Public URL of the web app — used to build the links inside verification /
  // reset / sign-in emails. Falls back to the first CORS origin, then localhost.
  appUrl:
    process.env.APP_URL ??
    (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',')[0],

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? DEV_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? DEV_REFRESH_SECRET,
    accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
    refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '2592000', 10),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'EduBridge <no-reply@edubridge.network>',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER ?? '',
    otpTtl: parseInt(process.env.OTP_TTL ?? '300', 10),
  },

  s3: {
    region: process.env.AWS_REGION ?? 'auto',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    // Set to the Cloudflare R2 S3 API endpoint to use R2 instead of AWS S3, e.g.
    // https://<account_id>.r2.cloudflarestorage.com — leave empty for AWS S3.
    endpoint: process.env.S3_ENDPOINT || undefined,
    signedUrlTtl: parseInt(process.env.S3_SIGNED_URL_TTL ?? '3600', 10),
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '120', 10),
  },

  security: {
    maxFailedLogins: 5,
    lockDurationMs: 15 * 60 * 1000, // 15 min
  },

  auth: {
    // When true, new email signups are activated immediately (no verification
    // link needed). Intended for local/dev where SMTP isn't deliverable.
    autoVerifyEmail: process.env.AUTO_VERIFY_EMAIL === 'true',
  },
  };
};
