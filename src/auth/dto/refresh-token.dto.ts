import { ApiProperty } from '@nestjs/swagger';
import { StringField } from 'src/shared/decorators/dto.decorators';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token' })
  @StringField()
  refreshToken: string;
}
