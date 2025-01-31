import { Injectable, Inject } from '@nestjs/common';
import { Cluster } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Cluster, // Inject Cluster client
  ) {}

  async setKey(
    key: string,
    value: string,
    ttl: number = 3*24*60 * 60,
  ): Promise<void> {
    console.log('Setting value in Redis Cluster');
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  async getKey(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async deleteKey(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clearAll(): Promise<void> {
    await this.redisClient.flushall();
  }

  async deleteKeyWithPrefix(prefix: string): Promise<void> {
  console.log(`🔹 Deleting keys with prefix: ${prefix}*`);

  const nodes = this.redisClient.nodes('master');

  for (const node of nodes) {
    try {
      const stream = node.scanStream({
        match: `${prefix}:*`, // Prefix already includes hash tag
        count: 100,
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length) {
          await Promise.all(keys.map((key) => node.del(key)));
          console.log(`Deleted ${keys.length} keys from ${node.options.host}`);
        }
      });

      stream.on('end', () => {
        console.log(`Finished deleting keys on node ${node.options.host}`);
      });
    } catch (err) {
      console.error(`Error scanning node ${node.options.host}:`, err);
    }
  }
}}