import { PrismaService } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { ResponseService } from '@libs/shared';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}
  async test() {
    const res = await this.prisma.user.findMany();
    return this.response.success(res);
  }
}
