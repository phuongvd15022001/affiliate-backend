import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { GLOBAL_CONFIG } from 'src/configs/global.config';
import { ERole } from 'src/shared/constants/global.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: GLOBAL_CONFIG.jwt.secret,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(
    req: Request & { roles: string[] },
    payload: { sub: string; email: string; name: string; role: ERole },
  ) {
    const roles = req.roles;

    if (roles && roles.length > 0) {
      const hasPermission = roles.includes(payload.role);
      if (!hasPermission) {
        throw new ForbiddenException('You not have permission');
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}
