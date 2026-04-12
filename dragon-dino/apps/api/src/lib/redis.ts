import { createClient, type RedisClientType } from 'redis';
import { logger } from './logger.js';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

let client: RedisClientType | null = null;
let connecting = false;

async function getClient(): Promise<RedisClientType> {
  if (client?.isOpen) return client;
  if (connecting) {
    // Wait for connection in progress
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getClient();
  }

  connecting = true;
  client = createClient({
    url: REDIS_URL,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          logger.error('Redis max reconnect attempts reached');
          return new Error('Redis max reconnect attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  client.on('error', (err: Error) => logger.error('Redis error', { error: err.message }));
  client.on('connect', () => logger.info('Redis connected'));

  await client.connect();
  connecting = false;
  return client;
}

// Proxy that auto-connects on first use
export const redis = new Proxy({} as RedisClientType, {
  get(_target, prop: string) {
    return async (...args: unknown[]) => {
      const c = await getClient();
      const method = (c as Record<string, unknown>)[prop];
      if (typeof method === 'function') {
        return (method as (...a: unknown[]) => unknown).apply(c, args);
      }
      return method;
    };
  },
});

export { getClient as getRedisClient };
