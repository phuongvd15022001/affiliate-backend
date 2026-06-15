import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NumberField, StringField } from 'src/shared/decorators/dto.decorators';

export class CreateProductDto {
  @ApiProperty({ example: 'Milk Tee', description: 'Product name' })
  @StringField({ optional: false }, { min: 1, max: 100 })
  name: string;

  @ApiPropertyOptional({
    example: 'Fresh whole chicken',
    description: 'Product Description',
  })
  @StringField({ optional: true })
  description?: string;

  @ApiProperty({ example: 100, description: 'Product price' })
  @NumberField({ optional: false, min: 0 })
  price: number;
}
