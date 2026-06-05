import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { GLOBAL_CONFIG } from 'src/configs/global.config';
import { UsersService } from 'src/modules/users/users.service';
import { ERole } from 'src/shared/constants/global.constants';
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService
      .findOneByEmail(email)
      .catch(() => null);

    if (!user?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await AuthHelpers.verify(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as ERole,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '5m' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: GLOBAL_CONFIG.jwt.refreshSecret,
    });
    const hashedRefreshToken = await AuthHelpers.hash(refreshToken);

    await this.usersService.refreshToken(user.id, hashedRefreshToken);

    return { payload, accessToken, refreshToken };
  }

  async getInfo(id: number) {
    return this.usersService.findOne(id);
  }
}
