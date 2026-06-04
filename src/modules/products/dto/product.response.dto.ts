import { Type } from 'class-transformer';
import { ResField } from 'src/shared/decorators/dto.decorators';
import { UserResponseDto } from 'src/modules/users/dto/user.response.dto';

export class ProductResponseDto {
  @ResField({ example: 1, description: 'Product ID' })
  id: number;

  @ResField({ example: 'Chicken', description: 'Product Name' })
  name: string;

  @ResField({
    example: 'Fresh whole chicken',
    description: 'Product Description',
    required: false,
  })
  description?: string;

  @ResField({ example: 9.99, description: 'Product Price' })
  price: number;
}

export class ProductWithUserResponseDto extends ProductResponseDto {
  @ResField({
    type: () => UserResponseDto,
    description: 'Product owner',
    required: false,
  })
  @Type(() => UserResponseDto)
  user?: UserResponseDto;
}
