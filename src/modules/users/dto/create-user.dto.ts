import { ApiProperty } from '@nestjs/swagger';
import { EmailField, StringField } from 'src/shared/decorators/dto.decorators';

export class CreateUserDto {
  @ApiProperty({ example: 'Jon', description: 'User Name' })
  @StringField({ optional: false }, { min: 1, max: 50 })
  name: string;

  @ApiProperty({ example: 'jon@gmail.com', description: 'User Email' })
  @EmailField()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'User Password',
    minLength: 6,
    maxLength: 100,
  })
  @StringField({}, { min: 6, max: 100 })
  password: string;
}
