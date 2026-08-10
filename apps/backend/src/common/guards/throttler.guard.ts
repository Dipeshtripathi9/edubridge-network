import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit guard that is bypassed under NODE_ENV=test so functional e2e
 * suites (which hammer auth endpoints) aren't throttled. Active in all other
 * environments. (overrideGuard() does not affect APP_GUARD-registered guards.)
 *
 * Fails OPEN: rate limiting is backed by Redis in production, and a Redis
 * outage (e.g. a quota-exhausted provider) must degrade to "no rate
 * limiting" rather than take down every request in the app — availability
 * over strict enforcement during an infra hiccup.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(AppThrottlerGuard.name);

  protected async shouldSkip(): Promise<boolean> {
    return process.env.NODE_ENV === 'test';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch (err) {
      this.logger.warn(`Rate-limit check failed, allowing request through: ${(err as Error).message}`);
      return true;
    }
  }
}
