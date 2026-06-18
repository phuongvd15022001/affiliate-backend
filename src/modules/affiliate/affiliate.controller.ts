import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/shared/interceptors/transform.interceptor';
import { AffiliateService } from './affiliate.service';
import { AffiliateResultResponseDto } from './dto/affiliate.response.dto';
import { GetLinkDto } from './dto/get-link.dto';
import { ReturnLinkDto } from './dto/return-link.dto';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @UseInterceptors(new TransformInterceptor(AffiliateResultResponseDto))
  @Post('get-link')
  @ApiOperation({ summary: 'Extract and format Shopee links from content' })
  @ApiBody({ type: GetLinkDto })
  getLink(@Body() dto: GetLinkDto) {
    return this.affiliateService.getLink(dto.content);
  }

  @UseInterceptors(new TransformInterceptor(AffiliateResultResponseDto))
  @Post('return-link')
  @ApiOperation({
    summary: 'Replace old links with new affiliate links in content',
  })
  @ApiBody({ type: ReturnLinkDto })
  returnLink(@Body() dto: ReturnLinkDto) {
    return this.affiliateService.returnLink(dto.content, dto.linksNew);
  }
}
