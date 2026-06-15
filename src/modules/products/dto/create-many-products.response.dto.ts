import { ResField } from 'src/shared/decorators/dto.decorators';

export class CreateManyProductsResponseDto {
  @ResField({ example: 5, description: 'Number of products created' })
  count: number;
}
