# Email delivery (verification, password reset, college verify)

The app sends a real email with a secure link for three flows:

| Flow | Trigger | Email | After clicking |
|------|---------|-------|----------------|
| **Account verification** | Sign up | "Verify your EduBridge account" → `/verify-email?token=…` | Account is activated, user can log in |
| **Password reset** | Forgot password | "Reset your EduBridge password" → `/reset-password?token=…` | User sets a new password |
| **College email verify** | "Authorize" in Get Verified | "Verify your college email" → `/verify/college-email?token=…` | Verified-student badge granted |

All three are already implemented. They only send once **SMTP credentials** are set — until
then the link is logged (dev) and returned as `devLink` (non-production) so the flow is testable.

## What to configure (environment variables)

Set these on the hosted backend:

```bash
# Public URL of the web app — used to build the link inside every email.
APP_URL=https://app.edubridge.network

# SMTP credentials from your email provider (see below).
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<provider username / API key id>
SMTP_PASS=<provider password / API key secret>
SMTP_FROM=EduBridge Network <no-reply@edubridge.network>
```

That's it — set them and all three flows start delivering. No code change needed.

## Choosing a provider (important for 50k users)

**Do NOT use a personal Gmail/Google Workspace account** — it caps at ~500 emails/day and will
get rate-limited or blocked at scale. Use a transactional email provider built for volume:

- **Amazon SES** — cheapest at scale (~$0.10 per 1,000 emails), 62k/month free from AWS infra.
- **Resend** — simplest developer setup, generous free tier, SMTP + API.
- **SendGrid / Mailgun / Postmark** — all fine; free tiers cover early volume.

Any of them gives you an `SMTP_HOST/PORT/USER/PASS`. Then:
1. **Verify your sending domain** (add the provider's SPF, DKIM, DMARC DNS records) so mail lands
   in the inbox, not spam — this is the single most important step for deliverability.
2. Use a `no-reply@yourdomain` `SMTP_FROM` on the verified domain.
3. For 50k users you'll send well within any paid tier; start on SES or Resend.

## Scale & reliability notes (already in the code)

- **Non-blocking sends** — signup, reset, and college-verify fire the email without blocking the
  HTTP response, so request latency never depends on SMTP.
- **Connection pooling** — the SMTP transport reuses up to 5 pooled connections, so bursts of
  signups don't open a socket per email.
- **Best-effort with logging** — a transient SMTP failure is logged, never crashes the flow.
- **Next reliability step (optional):** move sending to a BullMQ + Redis queue with retries so a
  provider blip re-delivers automatically. The current setup is fine for launch volume.
