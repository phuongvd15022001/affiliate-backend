import { ApiProperty } from '@nestjs/swagger';
import { StringField } from 'src/shared/decorators/dto.decorators';

export class GetLinkDto {
  @ApiProperty({
    example:
      '12H TỔNG HỢP MÃ SHOPEE 18.6 ❣️❣️\n\n- 12H: Lên mã 25% video tại: https://s.shopee.vn/3L8cGX6LQ7\n\n1. MÃ NHẬP TAY:\n- AFFBEER giảm 20K/66K áp list: https://s.shopee.vn/80A3IjcMZa',
    description: 'Nội dung bài đăng chứa các link Shopee cần extract',
  })
  @StringField()
  content: string;
}
