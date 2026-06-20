import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit guard that is bypassed under NODE_ENV=test so functional e2e
 * suites (which hammer auth endpoints) aren't throttled. Active in all other
 * environments. (overrideGuard() does not affect APP_GUARD-registered guards.)
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(): Promise<boolean> {
    return process.env.NODE_ENV === 'test';
  }
}
