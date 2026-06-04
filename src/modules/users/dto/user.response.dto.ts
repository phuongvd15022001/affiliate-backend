import { Type } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dto/product.response.dto';
import { ResField } from 'src/shared/decorators/dto.decorators';

export class UserResponseDto {
  @ResField({ example: 1, description: 'User ID' })
  id: number;

  @ResField({ example: 'Jon', description: 'User Name' })
  name: string;

  @ResField({ example: 'jon@gmail.com', description: 'User Email' })
  email: string;
}

export class UserWithProductResponseDto extends UserResponseDto {
  @ResField({ type: [ProductResponseDto], description: 'User products' })
  @Type(() => ProductResponseDto)
  Product?: ProductResponseDto[];
}

export class CreateManyUsersResponseDto {
  @ResField({ example: 5, description: 'Number of users created' })
  count: number;
}
