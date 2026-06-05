import { ApiProperty } from '@nestjs/swagger';
import { EmailField, StringField } from 'src/shared/decorators/dto.decorators';

export class LoginDto {
  @ApiProperty({ example: 'jon@gmail.com', description: 'User Email' })
  @EmailField()
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @StringField()
  password: string;
}
