import { Controller, Post, Delete, Body } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}
  
  @Post('set')
  async setKey(@Body() body: { prefix: string; key: string; value: string }) {
    const { prefix, key, value } = body;
    const fullKey = `{${prefix}}:${key}`; // Use hash tag to force keys to the same node
    await this.redisService.setKey(fullKey, value);
    return { message: `Key ${fullKey} set successfully` };
  }

  @Delete('delete')
  async deleteByPrefix(@Body() body: { prefix: string }) {
    const { prefix } = body;
    const transformedPrefix = `{${prefix}}`; // Add hash tag to match keys
    await this.redisService.deleteKeyWithPrefix(transformedPrefix);
    return { message: `All keys with prefix ${prefix} deleted successfully` };
  }
}
