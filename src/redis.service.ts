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
    ttl: number = 60 * 60,
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
}


