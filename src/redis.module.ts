import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tedis } from 'tedis';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RedisController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const client = new Tedis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        });
        const redisDb = configService.get<number>('REDIS_DB', 0);
        await client.command('SELECT', redisDb);
        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService], // Export RedisService
})
export class RedisModule {}
