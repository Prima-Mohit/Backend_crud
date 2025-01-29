import { Controller, Post, Delete, Body } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('set')
  async setKey(@Body() body: { prefix: string; key: string; value: string }) {
    const { prefix, key, value } = body;
    const fullKey = `${prefix}:${key}`; // Append prefix to key
    await this.redisService.setKey(fullKey, value);
    return { message: `Key ${fullKey} set successfully` };
  }

  @Delete('delete')
  async deleteByPrefix(@Body() body: { prefix: string }) {
    const { prefix } = body;
    await this.redisService.deleteKeyWithPrefix(prefix);
    return { message: `All keys with prefix ${prefix} deleted successfully` };
  }
}
