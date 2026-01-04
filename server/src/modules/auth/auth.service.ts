import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { Tokens } from 'src/common/interfaces/jwt-payload.interface';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    this.logger.log(`Registration attempt for email: ${dto.email}`);

    // Check if user already exists
    const existingUser = await this.userService.findUserByEmail(dto.email);
    if (existingUser) {
      this.logger.warn(
        `Registration failed - user already exists: ${dto.email}`,
      );
      throw new ConflictException('User already exists');
    }

    const newUser = await this.userService.createUser(dto);

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = await bcrypt.hash(verifyToken, 12);

    await this.userService.updateHashedVerifyToken(
      newUser.id,
      hashedVerifyToken,
    );

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(newUser, verifyToken);
      this.logger.log(`Verification email sent to: ${dto.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${dto.email}:`,
        error,
      );
    }

    this.logger.log(
      `User registered successfully: ${dto.email} (ID: ${newUser.id})`,
    );
    return {
      message: 'User registered. Please check email to verify account.',
    };
  }

  async verifyAccount(userId: string, token: string): Promise<void> {
    this.logger.log(`Account verification attempt for user ID: ${userId}`);

    const user = await this.userService.findUserForVerification(userId);
    if (user.isVerified) {
      this.logger.warn(`User ${userId} is already verified.`);
      return;
    }
    if (!user.hashedVerifyToken) {
      throw new BadRequestException('Invalid verification request');
    }

    const isMatch = await bcrypt.compare(token, user.hashedVerifyToken);
    if (!isMatch) {
      this.logger.error(
        `Verification failed for user ${userId}: Invalid token`,
      );
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.userService.markEmailAsVerified(userId);

    this.logger.log(`Account verified successfully for user ID: ${userId}`);
  }

  async login(dto: LoginDto): Promise<Tokens> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Login failed - user not found: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      this.logger.warn(`Login failed - unverified account: ${dto.email}`);
      throw new UnauthorizedException(
        'Account not verified. Please verify your email first.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!isMatch) {
      this.logger.warn(`Login failed - invalid password: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Login successful for user: ${dto.email} (ID: ${user.id})`);
    return tokens;
  }

  async logout(userId: string): Promise<boolean> {
    this.logger.log(`Logout for user ID: ${userId}`);

    await this.userService.updateHashedRefreshToken(userId, null);

    this.logger.log(`Logout successful for user ID: ${userId}`);

    return true;
  }

  async refreshToken(userId: string, refreshToken: string): Promise<Tokens> {
    this.logger.log(`Refresh token attempt for user ID: ${userId}`);

    const user = await this.userService.findUserForRefresh(userId);
    // Check if user exists and has a refresh token
    if (!user || !user.hashedRefreshToken) {
      this.logger.warn(`Refresh token failed - Access Denied: ${userId}`);
      throw new ForbiddenException('Access denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatch) {
      this.logger.warn(
        `Refresh token failed - invalid token (Reuse detected?): ${userId}`,
      );
      // Update hashedRefreshToken to null to invalidate the token
      await this.userService.updateHashedRefreshToken(userId, null);
      throw new ForbiddenException('Access denied');
    }

    // Generate new access and refresh tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(
      `Refresh token successful for user: ${user.email} (ID: ${userId})`,
    );

    return tokens;
  }

  private async getTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<Tokens> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
  }
}
