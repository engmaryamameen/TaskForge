import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RefreshToken } from '../entities/refresh-token.entity';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId });
  }

  async generateRefreshToken(
    userId: string,
    familyId?: string,
    device?: string,
    ip?: string,
  ): Promise<{ rawToken: string; familyId: string }> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const resolvedFamilyId = familyId ?? randomUUID();

    const ttl = this.configService.get<string>('auth.refreshTokenTtl', '7d');
    const expiresAt = new Date(Date.now() + this.parseTtl(ttl));

    const deviceStr = device != null ? String(device).slice(0, 512) : undefined;
    const ipStr = ip != null ? String(ip).slice(0, 64) : undefined;

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      familyId: resolvedFamilyId,
      device: deviceStr,
      ip: ipStr,
      expiresAt,
    });

    this.logger.log(`Refresh token generated for user ${userId}`);
    return { rawToken, familyId: resolvedFamilyId };
  }

  async verifyRefreshToken(rawToken: string): Promise<RefreshToken> {
    const tokenHash = this.hashToken(rawToken);
    const token =
      await this.refreshTokenRepository.findValidByTokenHash(tokenHash);

    if (!token) {
      throw new AppError(
        ErrorCodes.REFRESH_TOKEN_INVALID,
        'Invalid or expired refresh token',
        401,
      );
    }

    return token;
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.revokeById(tokenId);
    this.logger.log(`Refresh token ${tokenId} revoked`);
  }

  /**
   * Atomically revokes a refresh token. Returns the token if revocation
   * succeeded, or null if the token was already revoked (race/theft).
   */
  async atomicRevokeRefreshToken(tokenId: string): Promise<RefreshToken | null> {
    const result = await this.refreshTokenRepository.atomicRevoke(tokenId);
    if (result) {
      this.logger.log(`Refresh token ${tokenId} atomically revoked`);
    }
    return result;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId);
    this.logger.log(`All refresh tokens revoked for user ${userId}`);
  }

  async revokeByFamily(familyId: string): Promise<void> {
    await this.refreshTokenRepository.revokeByFamily(familyId);
    this.logger.log(`Token family ${familyId} revoked`);
  }

  async generateTokenPair(
    userId: string,
    familyId?: string,
    device?: string,
    ip?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    familyId: string;
  }> {
    const accessToken = await this.generateAccessToken(userId);
    const refresh = await this.generateRefreshToken(
      userId,
      familyId,
      device,
      ip,
    );

    return {
      accessToken,
      refreshToken: refresh.rawToken,
      familyId: refresh.familyId,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTtl(ttl: string): number {
    const match = ttl.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
