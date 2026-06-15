import { ArrayField } from 'src/shared/decorators/dto.decorators';
import { CreateUserDto } from './create-user.dto';

export class CreateUsersDto {
  @ArrayField(CreateUserDto)
  users: CreateUserDto[];
}
