import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { ServerOptions, Server } from 'socket.io';
import { RedisService } from '../../redis/redis.service';

/**
 * Socket.IO adapter backed by Redis pub/sub so real-time events (messages,
 * notifications) are broadcast across ALL app instances — required to run the
 * API as multiple horizontally-scaled replicas behind a load balancer.
 *
 * Without this, a client connected to replica A never receives an event emitted
 * from replica B. `connect()` is best-effort: if Redis is unavailable the server
 * falls back to the default in-memory adapter (single-instance still works).
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly redis: RedisService,
  ) {
    super(app);
  }

  async connect(): Promise<void> {
    try {
      const pubClient = this.redis.client.duplicate();
      const subClient = this.redis.client.duplicate();
      await Promise.all([
        pubClient.status === 'ready' ? Promise.resolve() : pubClient.connect().catch(() => {}),
        subClient.status === 'ready' ? Promise.resolve() : subClient.connect().catch(() => {}),
      ]);
      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Socket.IO Redis adapter enabled (multi-instance broadcasts).');
    } catch (err) {
      this.logger.warn(
        `Socket.IO Redis adapter unavailable, falling back to in-memory: ${(err as Error).message}`,
      );
    }
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, options);
    if (this.adapterConstructor) server.adapter(this.adapterConstructor);
    return server;
  }
}
