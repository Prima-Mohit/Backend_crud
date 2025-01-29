import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Tedis } from 'tedis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly redisDb: number;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Tedis,
    private readonly configService: ConfigService,
  ) {
    this.redisDb = this.configService.get<number>('REDIS_DB', 0); // Default DB: 0
  }

  async onModuleInit() {
    await this.redisClient.command('SELECT', this.redisDb);
  }

  async setKey(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
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
