import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from './token.service';
import { RegisterDto, LoginDto } from '../dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const exists = await this.usersService.existsByEmail(email);
    if (exists) {
      throw new AppError(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        'Email already registered',
        409,
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.usersService.createUser({
      email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const tokens = await this.tokenService.generateTokenPair(user.id);

    this.logger.log(`User registered: ${user.id}`);
    this.eventEmitter.emit(EventType.USER_REGISTERED, {
      type: EventType.USER_REGISTERED,
      payload: { userId: user.id },
      occurredAt: new Date(),
      organizationId: '',
      triggeredBy: user.id,
    } satisfies DomainEvent);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async login(dto: LoginDto, device?: string, ip?: string) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login attempt with unknown email`);
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        'Invalid email or password',
        401,
      );
    }

    const passwordValid = await argon2
      .verify(user.passwordHash, dto.password)
      .catch(() => false);

    if (!passwordValid) {
      this.logger.warn(`Failed login attempt for user ${user.id}`);
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        'Invalid email or password',
        401,
      );
    }

    if (user.status !== 'active') {
      throw new AppError(
        ErrorCodes.ACCOUNT_SUSPENDED,
        'Account suspended',
        403,
      );
    }

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      undefined, // new familyId per login session
      device,
      ip,
    );

    this.logger.log(`User logged in: ${user.id}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async refreshTokens(rawRefreshToken: string, device?: string, ip?: string) {
    const oldToken =
      await this.tokenService.verifyRefreshToken(rawRefreshToken);

    // Verify user is still active
    const user = await this.usersService.findById(oldToken.userId);
    if (!user || user.status !== 'active') {
      throw new AppError(
        ErrorCodes.ACCOUNT_SUSPENDED,
        'Account suspended',
        403,
      );
    }

    // Revoke old token (rotation)
    await this.tokenService.revokeRefreshToken(oldToken.id);

    // Issue new pair carrying forward the familyId
    const tokens = await this.tokenService.generateTokenPair(
      oldToken.userId,
      oldToken.familyId,
      device,
      ip,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || user.status !== 'active') {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }
    return { user: UserResponseDto.fromEntity(user) };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    try {
      const token =
        await this.tokenService.verifyRefreshToken(rawRefreshToken);
      await this.tokenService.revokeRefreshToken(token.id);
      this.logger.log(`User logged out, token ${token.id} revoked`);
    } catch {
      // Always succeed — no information leakage
    }
  }
}
