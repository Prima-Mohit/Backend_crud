import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cluster } from 'ioredis';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RedisController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cluster = new Cluster(
          [
            {
              host: configService.get<string>('REDIS_HOST_1', '127.0.0.1'),
              port: 7001,
            },
            {
              host: configService.get<string>('REDIS_HOST_2', '127.0.0.1'),
              port: 7002,
            },
            {
              host: configService.get<string>('REDIS_HOST_3', '127.0.0.1'),
              port: 7003,
            },
          ],
          {
            redisOptions: {
              password: configService.get<string>('REDIS_PASSWORD', ''),
            },
          },
        );

        cluster.on('error', (err) => {
          console.error('Redis Cluster error:', err);
        });

        return cluster;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
