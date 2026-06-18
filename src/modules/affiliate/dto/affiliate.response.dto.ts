import { ResField } from 'src/shared/decorators/dto.decorators';

export class AffiliateResultResponseDto {
  @ResField({
    example: 'https://s.shopee.vn/xxx',
    description: 'Processing result',
  })
  result: any;
}
