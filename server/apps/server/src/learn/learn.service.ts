import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class LearnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}

  // 读取单词列表
  async getWordList(id: string, userId: string) {
    // 1. 如果没有购买过课程进入这个页面 非法请求
    const courseRecord = await this.prisma.courseRecord.findFirst({
      where: {
        userId: userId,
        courseId: id,
        isPurchased: true,
      },
      include: {
        course: true, // 把关联的课程也查出来
      },
    });
    if (!courseRecord) {
      return this.response.error(null, '非法请求');
    }
    const courseType = courseRecord.course.value; // 单词所属类型对应着课程的类型，比如gk就是高考单词，也是高考相关课程
    // 学习过的单次会被加入到 wordBookRecords 库中
    const words = await this.prisma.wordBook.findMany({
      where: {
        [courseType]: true,
        // 如果单次存在 wordBookRecords 库中，说明已经掌握过，就不需要查出来
        wordBookRecords: {
          none: {
            // 表示该项满足何种条件不需要被查出来
            userId: userId,
          },
        },
      },
      skip: 0, // 跳过0条 从第一条开始
      take: 10, // 取10条
      orderBy: {
        frq: 'desc', // 排序频率越高越靠前
      },
    });
    return this.response.success(words);
  }

  /**
   * 保存单词到 wordBookRecord
   */
  async saveWordMaster(wordIds: string[], userId: string) {
    // 1.保存单词到 wordBookRecord
    const wordBookRecords = wordIds.map((wordId) => ({
      wordId: wordId, //单词id
      userId: userId, //用户id
      isMaster: true, //是否掌握
    }));
    await this.prisma.wordBookRecord.createMany({
      data: wordBookRecords,
    });
    // 2.更新用户学习单词的数量
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        wordNumber: {
          increment: wordIds.length, // 这次学习了单词的数量（累加）
        },
      },
    });
    return this.response.success({
      wordNumber: user.wordNumber, // 学习完单词的数量
    });
  }
}
