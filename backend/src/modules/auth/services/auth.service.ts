import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from './token.service';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from '../dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';
import { MailService } from '../../mail/mail.service';
import { EmailVerificationTokenRepository } from '../repositories/email-verification-token.repository';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  private hashOpaqueToken(raw: string): string {
    return createHash('sha256').update(raw, 'utf8').digest('hex');
  }

  private newOpaqueToken(): string {
    return randomBytes(32).toString('hex');
  }

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
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
    });

    const rawToken = this.newOpaqueToken();
    const tokenHash = this.hashOpaqueToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await this.emailVerificationTokenRepository.invalidateUnusedForUser(user.id);
    await this.emailVerificationTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    try {
      await this.mailService.sendVerifyEmail({
        to: user.email,
        firstName: user.firstName,
        token: rawToken,
      });
    } catch (err) {
      this.logger.error(
        `Verification email failed for ${user.id}: ${err instanceof Error ? err.message : err}`,
      );
      throw new AppError(
        ErrorCodes.INTERNAL_ERROR,
        'Could not send verification email. Try again later.',
        500,
      );
    }

    this.logger.log(`User registered (pending verification): ${user.id}`);

    return {
      message:
        'Account created. Please check your email to verify your account.',
      nextStep: 'VERIFY_EMAIL' as const,
      email: user.email,
    };
  }

  async verifyEmail(
    dto: VerifyEmailDto,
    device?: string,
    ip?: string,
  ): Promise<{
    message: string;
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    const tokenHash = this.hashOpaqueToken(dto.token);
    const row =
      await this.emailVerificationTokenRepository.findUnusedByTokenHash(
        tokenHash,
      );

    if (!row) {
      throw new AppError(
        ErrorCodes.VERIFICATION_TOKEN_INVALID,
        'Invalid verification link.',
        400,
      );
    }

    if (row.expiresAt <= new Date()) {
      throw new AppError(
        ErrorCodes.VERIFICATION_TOKEN_EXPIRED,
        'This verification link has expired. Request a new one.',
        400,
      );
    }

    let user = await this.usersService.findById(row.userId);
    if (!user) {
      throw new AppError(
        ErrorCodes.VERIFICATION_TOKEN_INVALID,
        'Invalid verification link.',
        400,
      );
    }

    if (!user.emailVerifiedAt) {
      await this.usersService.setEmailVerifiedAt(user.id, new Date());
      await this.emailVerificationTokenRepository.markUsed(row.id);

      user = await this.usersService.findById(user.id);
      if (!user) {
        throw new AppError(ErrorCodes.INTERNAL_ERROR, 'Unexpected state', 500);
      }

      this.eventEmitter.emit(EventType.USER_REGISTERED, {
        type: EventType.USER_REGISTERED,
        payload: { userId: user.id },
        occurredAt: new Date(),
        organizationId: user.currentOrganizationId ?? '',
        triggeredBy: user.id,
      } satisfies DomainEvent);
    } else {
      await this.emailVerificationTokenRepository.markUsed(row.id);
      user = await this.usersService.findById(user.id);
      if (!user) {
        throw new AppError(ErrorCodes.INTERNAL_ERROR, 'Unexpected state', 500);
      }
    }

    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      undefined,
      device,
      ip,
    );

    return {
      message: 'Email verified successfully.',
      user: UserResponseDto.fromEntity(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async resendVerificationEmail(dto: ResendVerificationDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    const generic = {
      message:
        'If an account exists for this email that is not yet verified, we sent a verification link.',
    };

    if (!user || user.emailVerifiedAt) {
      return generic;
    }

    const rawToken = this.newOpaqueToken();
    const tokenHash = this.hashOpaqueToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    await this.emailVerificationTokenRepository.invalidateUnusedForUser(
      user.id,
    );
    await this.emailVerificationTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    try {
      await this.mailService.sendVerifyEmail({
        to: user.email,
        firstName: user.firstName,
        token: rawToken,
      });
    } catch (err) {
      this.logger.warn(
        `Resend verification email failed: ${err instanceof Error ? err.message : err}`,
      );
    }

    return generic;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    const generic = {
      message:
        'If an account exists for this email, we sent password reset instructions.',
    };

    if (!user || user.status !== 'active') {
      return generic;
    }

    const rawToken = this.newOpaqueToken();
    const tokenHash = this.hashOpaqueToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.passwordResetTokenRepository.invalidateUnusedForUser(user.id);
    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    try {
      await this.mailService.sendPasswordResetEmail({
        to: user.email,
        token: rawToken,
      });
    } catch (err) {
      this.logger.warn(
        `Password reset email failed: ${err instanceof Error ? err.message : err}`,
      );
    }

    return generic;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashOpaqueToken(dto.token);
    const row =
      await this.passwordResetTokenRepository.findUnusedByTokenHash(tokenHash);

    if (!row) {
      throw new AppError(
        ErrorCodes.RESET_TOKEN_INVALID,
        'Invalid or expired password reset link.',
        400,
      );
    }

    if (row.expiresAt <= new Date()) {
      throw new AppError(
        ErrorCodes.RESET_TOKEN_EXPIRED,
        'This reset link has expired. Request a new one.',
        400,
      );
    }

    const user = await this.usersService.findById(row.userId);
    if (!user || user.status !== 'active') {
      throw new AppError(
        ErrorCodes.RESET_TOKEN_INVALID,
        'Invalid or expired password reset link.',
        400,
      );
    }

    const passwordHash = await argon2.hash(dto.password);
    await this.usersService.updatePasswordHash(user.id, passwordHash);
    await this.passwordResetTokenRepository.markUsed(row.id);
    await this.tokenService.revokeAllForUser(user.id);

    return {
      message:
        'Password updated. Sign in with your new password.',
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

    if (!user.emailVerifiedAt) {
      throw new AppError(
        ErrorCodes.EMAIL_NOT_VERIFIED,
        'Please verify your email before signing in.',
        403,
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
      undefined,
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

    // Atomically revoke the old token — if this fails, the token was already
    // consumed (concurrent request or theft). Revoke the entire family.
    const revoked = await this.tokenService.atomicRevokeRefreshToken(oldToken.id);
    if (!revoked) {
      // Token was already revoked — this is either a race condition or token theft.
      // Revoke the entire family to be safe (defense-in-depth).
      this.logger.warn(
        `Refresh token reuse detected for family ${oldToken.familyId} — revoking family`,
      );
      await this.tokenService.revokeByFamily(oldToken.familyId);
      throw new AppError(
        ErrorCodes.REFRESH_TOKEN_INVALID,
        'Invalid or expired refresh token',
        401,
      );
    }

    const user = await this.usersService.findById(oldToken.userId);
    if (!user || user.status !== 'active') {
      throw new AppError(
        ErrorCodes.ACCOUNT_SUSPENDED,
        'Account suspended',
        403,
      );
    }
    if (!user.emailVerifiedAt) {
      throw new AppError(
        ErrorCodes.EMAIL_NOT_VERIFIED,
        'Please verify your email before signing in.',
        403,
      );
    }

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
    if (!user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }
    if (!user.emailVerifiedAt) {
      throw new AppError(
        ErrorCodes.EMAIL_NOT_VERIFIED,
        'Please verify your email before signing in.',
        403,
      );
    }
    if (user.status !== 'active') {
      throw new AppError(ErrorCodes.ACCOUNT_SUSPENDED, 'Account suspended', 403);
    }
    return { user: UserResponseDto.fromEntity(user) };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const patch: { firstName?: string; lastName?: string } = {};
    if (dto.firstName !== undefined) patch.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) patch.lastName = dto.lastName.trim();

    if (Object.keys(patch).length === 0) {
      return this.getMe(userId);
    }

    await this.usersService.updateProfile(userId, patch);
    return this.getMe(userId);
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
