import { Controller, Get, Param, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('set')
  async setKey(@Body('key') key: string, @Body('value') value: string) {
    await this.redisService.setKey(key, value);
    return { message: `Key '${key}' set successfully.` };
  }

  @Get(':key')
  async getKey(@Param('key') key: string): Promise<string | null> {
    return await this.redisService.getKey(key);
  }

  @Delete(':key')
  async deleteKey(@Param('key') key: string): Promise<string> {
    await this.redisService.deleteKey(key);
    return `Key "${key}" deleted successfully.`;
  }
}
