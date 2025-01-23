import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RequestInterceptor } from 'src/interceptors/request.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Protecting the route
  async create(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.usersService.createUser(email, password);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // Protecting the route
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // Protecting the route
  async findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard) // Protecting the route
  async update(
    @Param('id') id: number,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.usersService.update(id, email, password);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // Protecting the route
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
