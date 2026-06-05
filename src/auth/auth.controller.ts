import {
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Roles } from 'src/auth/auth.roles.decorator';
import { ERole } from 'src/shared/constants/global.constants';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth.response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh.guard';
import { LocalAuthGuard } from './guard/local.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(ERole.PUBLIC)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(new TransformInterceptor(AuthResponseDto))
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Request() req: Request & { user: User }) {
    return this.authService.login(req.user);
  }

  @Roles(ERole.PUBLIC)
  @UseGuards(JwtRefreshAuthGuard)
  @UseInterceptors(new TransformInterceptor(AuthResponseDto))
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthResponseDto })
  refreshTokens(@Request() req: Request & { user: User }) {
    return this.authService.login(req.user);
  }
}
