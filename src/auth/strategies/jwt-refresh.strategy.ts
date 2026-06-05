import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { GLOBAL_CONFIG } from 'src/configs/global.config';
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: GLOBAL_CONFIG.jwt.refreshSecret,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(
    req: Request & { body: { refreshToken: string } },
    payload: { sub: number; email: string },
  ) {
    const user = await this.authService.getInfo(payload.sub);

    if (!user || !user.refreshToken)
      throw new UnauthorizedException('User or Refresh Token not found');

    const refreshToken = req.body.refreshToken;

    const tokenMatches = await AuthHelpers.verify(
      refreshToken,
      user.refreshToken,
    );

    if (!tokenMatches)
      throw new UnauthorizedException('Refresh Token mismatch');

    return user;
  }
}
