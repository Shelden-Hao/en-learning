import { WordQuery } from '@en-learning/common/word';
import { PrismaService, ResponseService } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@libs/shared/generated/prisma/client';

@Injectable()
export class WordBookService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
  ) {}

  private toBoolean(value: string | boolean): boolean | undefined {
    return value === 'true' ? true : undefined;
  }

  async findAll(query: WordQuery) {
    const { page = 1, pageSize = 12, word, ...rest } = query;
    // 将字符串的value转为布尔值
    const tags = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, this.toBoolean(value)]),
    );
    // 如果使用false 的话，数据库仍然会查询，而我们的需要是不查询，所以使用undefined
    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...tags,
    };
    const [total = 0, list = []] = await Promise.all([
      this.prismaService.wordBook.count({ where }),
      this.prismaService.wordBook.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: {
          frq: 'desc',
        },
      }),
    ]);
    return this.responseService.success({ total, list });
  }
}
