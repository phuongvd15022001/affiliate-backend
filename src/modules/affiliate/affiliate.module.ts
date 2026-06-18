import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';

@Module({
  imports: [HttpModule],
  providers: [AffiliateService],
  controllers: [AffiliateController],
  exports: [AffiliateService],
})
export class AffiliateModule {}
