import { ApiPropertyOptional } from '@nestjs/swagger';
import { NumberField, StringField } from 'src/shared/decorators/dto.decorators';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Milk', description: 'Product name' })
  @StringField({ optional: true }, { min: 1, max: 100 })
  name?: string;

  @ApiPropertyOptional({
    example: 'Fresh whole chicken',
    description: 'Product Description',
  })
  @StringField({ optional: true })
  description?: string;

  @ApiPropertyOptional({ example: 100, description: 'Product price' })
  @NumberField({ optional: true, min: 0 })
  price?: number;
}
