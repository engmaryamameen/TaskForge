import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequestContext } from '../../../shared/interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const device = req.headers['user-agent'];
    const ip = req.ip;
    return this.authService.login(dto, device, ip);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const device = req.headers['user-agent'];
    const ip = req.ip;
    return this.authService.refreshTokens(dto.refreshToken, device, ip);
  }

  @Get('me')
  async me(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('logout')
  async logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() _user: RequestContext,
  ) {
    return this.authService.logout(dto.refreshToken);
  }
}
