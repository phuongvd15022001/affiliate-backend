import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AffiliateService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async newLink(oldLink: string): Promise<string> {
    const response = this.httpService.post(
      `https://affiliate.shopee.vn/api/v3/gql`,
      {
        operationName: 'batchGetCustomLink',
        query:
          '\n    query batchGetCustomLink($linkParams: [CustomLinkParam!], $sourceCaller: SourceCaller){\n      batchCustomLink(linkParams: $linkParams, sourceCaller: $sourceCaller){\n        shortLink\n        longLink\n        failCode\n      }\n    }\n    ',
        variables: {
          linkParams: [
            {
              originalLink: oldLink,
              advancedLinkParams: {
                subId1: 'shopee',
                subId2: 'kol',
                subId3: '2025',
                subId4: 'thu',
                subId5: 'sep8',
              },
            },
          ],
          sourceCaller: 'CUSTOM_LINK_CALLER',
        },
      },
      {
        headers: {
          Cookie: this.configService.get<string>('SHOPEE_AFFILIATE_COOKIE'),
          'x-sz-sdk-version': '1.12.21',
          'x-sap-sec': this.configService.get<string>('SHOPEE_X_SAP_SEC'),
          'x-sap-ri': this.configService.get<string>('SHOPEE_X_SAP_RI'),
          'sec-ch-ua':
            '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
          'af-ac-enc-dat': this.configService.get<string>(
            'SHOPEE_AF_AC_ENC_DAT',
          ),
        },
      },
    );

    const result = await lastValueFrom(response.pipe(map((res) => res)));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return result.data.data.batchCustomLink[0].shortLink as string;
  }

  getLink(file: string) {
    const links = this.extractLinksFromCode(file);

    const result = links
      .map((link, index) => (index > 0 && index % 5 === 0 ? '\n' : '') + link)
      .join('\n');

    return result;
  }

  returnLink(file: string, linksNew: string) {
    const links = this.extractLinksFromCode(file);

    const linksNewRaw = linksNew
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (linksNewRaw.length !== links.length) {
      throw new BadRequestException('Link count mismatch');
    }

    let fileNew = file;
    for (let i = 0; i < links.length; i++) {
      fileNew = fileNew.replace(links[i], linksNewRaw[i]);
    }

    return fileNew;
  }

  private extractLinksFromCode(code: string): string[] {
    const regex = /(https:\/\/s\.shopee\.vn\/\w+)/g;
    const regex1 = /(https:\/\/shope\.ee\/\w+)/g;
    return code.match(regex) ?? code.match(regex1) ?? [];
  }
}
