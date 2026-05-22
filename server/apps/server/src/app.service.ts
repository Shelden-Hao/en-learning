import { PrismaService } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}
  test() {
    const res = this.prisma.test();
    return this.response.success(res);
  }
}
