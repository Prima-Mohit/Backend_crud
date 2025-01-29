import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './users.entity';
import { UsersController } from './users.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '../redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisModule],
  providers: [UsersService, UsersRepository],

  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
