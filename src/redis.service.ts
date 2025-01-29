import { Injectable, Inject } from '@nestjs/common';
import { Tedis } from 'tedis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Tedis, // Inject REDIS_CLIENT token
  ) {}
  // async onModuleInit() {
  //   // Schedule cache clearing every hour
  //   setInterval(
  //     async () => {
  //       console.log('Clearing cache...');
  //       await this.clearAll();
  //       console.log('done');
  //     },
  //      10 * 1000,
  //   ); // 1 hour = 60 min * 60 sec * 1000 ms
  // }
  async setKey(key: string, value: string, ttl: number = 60*60): Promise<void> {//times 60sec 60 min 
    console.log('value set');
    await this.redisClient.set(key, value);
    await this.redisClient.command('EXPIRE', key, ttl); // Ensure expiration is set
  }

  async getKey(key: string): Promise<string | null> {
    const result = await this.redisClient.get(key);
    return result !== null ? String(result) : null;
  }

  async deleteKey(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clearAll(): Promise<void> {
    await this.redisClient.command('FLUSHDB');
  }
}
