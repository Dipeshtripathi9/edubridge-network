import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.get<string>('redis.url')!, {
      maxRetriesPerRequest: null,
      lazyConnect: false,
    });
  }

  /** Get a JSON value from cache. */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  /** Set a JSON value with TTL (seconds). */
  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const raw = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, raw, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, raw);
    }
  }

  /**
   * Cache-aside helper: return cached value or compute, store, and return it.
   */
  async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached !== null) return cached;
    const fresh = await fn();
    await this.setJson(key, fresh, ttlSeconds);
    return fresh;
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(...keys);
  }

  /** Delete all keys matching a pattern (used for cache invalidation). */
  async delPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({ match: pattern, count: 100 });
    const pipeline = this.client.pipeline();
    for await (const keys of stream) {
      for (const key of keys as string[]) pipeline.del(key);
    }
    await pipeline.exec();
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
