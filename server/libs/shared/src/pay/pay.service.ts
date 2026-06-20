import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlipaySdk } from 'alipay-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayService implements OnModuleInit {
  private alipaySdk: AlipaySdk;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // https://www.npmjs.com/package/alipay-sdk
    this.alipaySdk = new AlipaySdk({
      // 设置应用 ID
      appId: this.configService.get<string>('ALIPAY_APP_ID')!,
      // 设置应用私钥
      privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY')!,
      // 设置支付宝公钥
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY')!,
      // 网关
      gateway: this.configService.get<string>('ALIPAY_GATEWAY')!,
    });
  }

  getAlipaySdk() {
    return this.alipaySdk;
  }
}
