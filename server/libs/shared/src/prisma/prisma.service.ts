import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  test() {
    return 'test';
  }
}
