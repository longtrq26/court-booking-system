/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { IsNull, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    this.logger.log(`Creating new user with email: ${dto.email}`);

    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        this.logger.warn(
          `Registration failed: Email ${dto.email} already exists`,
        );
        throw new BadRequestException('Email already exists');
      }
      this.logger.warn(
        `Registration failed: Phone ${dto.phoneNumber} already exists`,
      );
      throw new BadRequestException('Phone number already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = this.userRepository.create({
      ...dto,
      hashedPassword,
      role: UserRole.CUSTOMER,
      isVerified: false,
    });

    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(`User created successfully: ID ${savedUser.id}`);

    return savedUser;
  }

  async markEmailAsVerified(id: string): Promise<void> {
    await this.userRepository.update(id, {
      isVerified: true,
      hashedVerifyToken: null,
    });

    this.logger.log(`User ID ${id} marked as verified`);
  }

  async findUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
      select: [
        'id',
        'email',
        'hashedPassword',
        'fullName',
        'role',
        'phoneNumber',
        'isVerified',
        'hashedRefreshToken',
      ],
    });
  }

  async findUserForVerification(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'email', 'isVerified', 'hashedVerifyToken'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserForRefresh(id: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'email', 'role', 'hashedRefreshToken'],
    });
  }

  async findUsersByRole(role: UserRole): Promise<UserEntity[]> {
    return await this.userRepository.find({
      where: { role, deletedAt: IsNull() },
      select: ['id', 'email', 'fullName', 'phoneNumber', 'role'],
    });
  }

  async updateHashedRefreshToken(
    id: string,
    token: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, { hashedRefreshToken: token });
  }

  async updateHashedVerifyToken(
    id: string,
    token: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, { hashedVerifyToken: token });
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`Updating user ID: ${userId}`);

    const user = await this.findUserById(userId);

    const updatedUser = this.userRepository.merge(user, dto);

    return await this.userRepository.save(updatedUser);
  }

  async deleteUser(userId: string): Promise<void> {
    this.logger.warn(`Soft deleting user ID: ${userId}`);

    await this.findUserById(userId);

    await this.userRepository.softDelete(userId);
  }
}
