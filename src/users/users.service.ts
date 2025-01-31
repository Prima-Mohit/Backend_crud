import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './users.entity';
import { RedisService } from '../Redis/redis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
  ) {}

  // Create a new user
  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.usersRepository.save(user);

      // Cache the new user
      await this.redisService.setKey(email, JSON.stringify(savedUser));
      // Invalidate all users cache since data is modified
      await this.redisService.deleteKey('all_users');

      return savedUser;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // Fetch a user by email
  async findByEmail(email: string): Promise<User> {
    // Check Redis first
    const cachedUser = await this.redisService.getKey(email);
    if (cachedUser) {
      console.log('Cache hit for user:', email);
      return JSON.parse(cachedUser);
    }

    // Fetch from DB if not cached
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Cache user data
    await this.redisService.setKey(email, JSON.stringify(user));

    return user;
  }

  // Fetch all users
  async findAll(): Promise<User[]> {
    const cachedUsers = await this.redisService.getKey('all_users');
    if (cachedUsers) {
      console.log('Cache hit for all users');
      return JSON.parse(cachedUsers);
    }

    // Fetch from DB if cache miss
    const users = await this.usersRepository.find();
    await this.redisService.setKey('all_users', JSON.stringify(users));

    console.log('Cache miss, fetching from DB');
    return users;
  }

  // Fetch a single user by ID
  async findOne(id: number): Promise<User> {
    // Check cache
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisService.getKey(cacheKey);
    if (cachedUser) {
      console.log(`Cache hit for user ID ${id}`);
      return JSON.parse(cachedUser);
    }

    // Fetch from DB if not in cache
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache user data
    await this.redisService.setKey(cacheKey, JSON.stringify(user));

    return user;
  }

  // Update user details
  async update(id: number, email: string, password: string): Promise<User> {
    const user = await this.findOne(id);
    user.email = email;
    user.password = await bcrypt.hash(password, 10);

    // Save updated user
    const updatedUser = await this.usersRepository.save(user);

    // Update cache
    await this.redisService.setKey(email, JSON.stringify(updatedUser));
    await this.redisService.setKey(`user:${id}`, JSON.stringify(updatedUser));

    // Invalidate all_users cache
    await this.redisService.deleteKey('all_users');

    return updatedUser;
  }

  // Delete a user
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    // Invalidate caches
    await this.redisService.deleteKey(user.email);
    await this.redisService.deleteKey(`user:${id}`);
    await this.redisService.deleteKey('all_users');
  }
}
