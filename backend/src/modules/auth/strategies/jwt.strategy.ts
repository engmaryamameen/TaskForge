import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';
import { ICacheService, CACHE_SERVICE } from '../../../infrastructure/cache';

const USER_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('auth.jwtSecret', 'changeme'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string }) {
    const cacheKey = `cache:user:${payload.sub}`;
    let user = await this.cacheService.get<{ id: string; status: string }>(
      cacheKey,
    );

    if (!user) {
      const dbUser = await this.usersService.findById(payload.sub);
      if (dbUser) {
        await this.cacheService.set(cacheKey, dbUser, USER_CACHE_TTL);
        user = dbUser;
      }
    }

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException();
    }

    return { userId: user.id };
  }
}
