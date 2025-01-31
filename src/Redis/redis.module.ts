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
              host: configService.get<string>('REDIS_HOST_1',process.env.REDIS_HOST_1),
              port: parseInt(process.env.REDIS_PORT_1),
            },
            {
              host: configService.get<string>('REDIS_HOST_2',process.env.REDIS_HOST_2),
              port: parseInt(process.env.REDIS_PORT_2),
            },
            {
              host: configService.get<string>('REDIS_HOST_3', process.env.REDIS_HOST_3),
              port: parseInt(process.env.REDIS_PORT_3),
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
