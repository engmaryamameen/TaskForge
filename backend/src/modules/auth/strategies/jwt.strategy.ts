import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('auth.jwtSecret', 'changeme'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException();
    }

    return { userId: user.id };
  }
}
