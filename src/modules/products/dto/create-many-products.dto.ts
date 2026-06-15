import { ArrayField } from 'src/shared/decorators/dto.decorators';
import { CreateProductDto } from './create-product.dto';

export class CreateManyProductsDto {
  @ArrayField(CreateProductDto, { minSize: 1 })
  items: CreateProductDto[];
}
