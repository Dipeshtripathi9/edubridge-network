import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.get<string>('redis.url')!, {
      // Bounded, not null: a command that can't complete (Redis down, quota
      // exhausted, etc.) must reject within a few seconds, never hang
      // forever — this is only a cache, the app must survive without it.
      maxRetriesPerRequest: 3,
      commandTimeout: 5000,
      lazyConnect: false,
    });
    this.client.on('error', (err) => this.logger.warn(`Redis client error: ${err.message}`));
  }

  /** Get a JSON value from cache. Never throws — a Redis outage just means no cache hit. */
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      this.logger.warn(`getJson(${key}) failed, treating as cache miss: ${(err as Error).message}`);
      return null;
    }
  }

  /** Set a JSON value with TTL (seconds). Never throws — caching is best-effort. */
  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const raw = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, raw, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, raw);
      }
    } catch (err) {
      this.logger.warn(`setJson(${key}) failed, skipping cache write: ${(err as Error).message}`);
    }
  }

  /**
   * Cache-aside helper: return cached value or compute, store, and return it.
   * `fn` always runs and its result is always returned if caching fails.
   */
  async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached !== null) return cached;
    const fresh = await fn();
    await this.setJson(key, fresh, ttlSeconds);
    return fresh;
  }

  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length) await this.client.del(...keys);
    } catch (err) {
      this.logger.warn(`del(${keys.join(',')}) failed: ${(err as Error).message}`);
    }
  }

  /** Delete all keys matching a pattern (used for cache invalidation). */
  async delPattern(pattern: string): Promise<void> {
    try {
      const stream = this.client.scanStream({ match: pattern, count: 100 });
      const pipeline = this.client.pipeline();
      for await (const keys of stream) {
        for (const key of keys as string[]) pipeline.del(key);
      }
      await pipeline.exec();
    } catch (err) {
      this.logger.warn(`delPattern(${pattern}) failed: ${(err as Error).message}`);
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
