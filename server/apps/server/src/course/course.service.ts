import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}

  async findAll() {
    const courses = await this.prisma.course.findMany();
    const list = courses.map((item) => ({
      ...item,
      price: Number(item.price).toFixed(2), // prisma 默认使用decimal.js(https://mikemcl.github.io/decimal.js/)来处理小数精度问题，这里需要Number转为十进制数字
    }));
    return this.response.success(list);
  }
}
