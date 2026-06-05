import { Type } from 'class-transformer';
import { ERole } from 'src/shared/constants/global.constants';
import { ResField } from 'src/shared/decorators/dto.decorators';

class AuthPayloadDto {
  @ResField({ example: 1, description: 'User ID' })
  sub: number;

  @ResField({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ResField({ example: 'John Doe', description: 'User name' })
  name: string;

  @ResField({ enum: ERole, description: 'User role' })
  role: ERole;
}

export class AuthResponseDto {
  @ResField({ type: AuthPayloadDto, description: 'JWT payload' })
  @Type(() => AuthPayloadDto)
  payload: AuthPayloadDto;

  @ResField({
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    description: 'Access token (5m)',
  })
  accessToken: string;

  @ResField({
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    description: 'Refresh token (7d)',
  })
  refreshToken: string;
}
