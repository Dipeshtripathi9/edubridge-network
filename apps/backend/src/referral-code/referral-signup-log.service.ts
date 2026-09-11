import { Injectable } from '@nestjs/common';
import { appendFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

// Appends one JSON-line per unique new student to a raw flat file — gmail
// (email) and mobile (phone) as submitted at account-creation time, plus
// the referral code assigned to them. Not a database table by design.
//
// Duplicate gmail/mobile is already impossible upstream: User.email and
// User.phone are unique-constrained, and every AuthService creation path
// checks for an existing account before creating one — this only ever
// logs a genuinely new, unique account, exactly once.
//
// CAUTION: if the backend host's filesystem is ephemeral (e.g. a Render
// web service with no persistent disk attached), this file is wiped on
// every redeploy/restart. Point REFERRAL_SIGNUP_LOG_PATH at a mounted
// persistent disk before relying on it in production.
export interface ReferralSignupLogEntry {
  userId: string;
  email: string | null;
  phone: string | null;
  code: string;
}

@Injectable()
export class ReferralSignupLogService {
  private readonly path =
    process.env.REFERRAL_SIGNUP_LOG_PATH ?? join(process.cwd(), 'data', 'referral-signups.jsonl');

  async append(entry: ReferralSignupLogEntry): Promise<void> {
    const line = `${JSON.stringify({ ...entry, loggedAt: new Date().toISOString() })}\n`;
    await mkdir(dirname(this.path), { recursive: true });
    await appendFile(this.path, line, 'utf8');
  }
}
