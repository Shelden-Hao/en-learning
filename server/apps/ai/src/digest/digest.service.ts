import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import dayjs from 'dayjs';
import { createAgent } from 'langchain';
import { createDeepSeek } from '../llm/llm.config';
import { tool } from '@langchain/core/tools';
import marked from 'marked';
import type { Queue } from 'bullmq'; //类型
import { digestQueueName } from './digest.queue';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class DigestService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(digestQueueName.name) private readonly digestQueue: Queue,
  ) {}
  private queryTool() {
    return tool(
      async ({ userId }: { userId: string }) => {
        const user = await this.prismaService.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            email: true, //邮箱
            name: true, //用户名
            wordNumber: true, //单词数量
            //查询今天的单词记录
            wordBookRecords: {
              where: {
                createdAt: {
                  //今天00:00:00 - 明天00:00:00
                  gte: dayjs().startOf('day').toDate(),
                  lte: dayjs().add(1, 'day').startOf('day').toDate(),
                },
              },
              select: {
                //找到单词表
                word: {
                  select: {
                    //找到单词 user.word.word
                    word: true,
                  },
                },
              },
            },
          },
        });
        return user;
      },
      {
        name: 'queryTool', //名字一定要语义化 唯一不能重复
        description: '根据用户id查询用户学习的单词记录', //他会通过desc 和 name 选择要不要调用这个工具
        //JSON Schema 是用来描述数据结构的，他可以用来验证数据是否符合要求
        schema: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: '用户id' },
          },
          required: ['userId'],
        },
      },
    );
  }
  async onModuleInit() {
    await this.digestQueue.add(
      digestQueueName.task.everyDayDigest,
      {},
      {
        repeat: {
          pattern: '0 0 * * *', // 每天0点执行 cron
        },
      },
    );
  }
  async handleEmailDigest() {
    console.log('定时任务执行了');
    // 1. 筛选合适用户(日报 = 打开定时任务 + 定时任务有时间 + 今天学过的单词 + 邮箱不为空)
    const userIds = await this.prismaService.user.findMany({
      where: {
        isTimingTask: true, //开启了定时任务
        timingTaskTime: { not: '' }, //定时任务时间不为空
        email: { not: null }, //邮箱不为空
        wordBookRecords: {
          //some-至少有一个 every-全部满足 none-空的
          some: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(), //>=今天00:00:00
              lte: dayjs().add(1, 'day').startOf('day').toDate(), //<=明天00:00:00
            },
          },
        },
      },
      select: {
        id: true,
        timingTaskTime: true,
        email: true,
      },
    });
    for (const user of userIds) {
      const agent = createAgent({
        model: createDeepSeek(),
        tools: [this.queryTool()],
        systemPrompt:
          '你是一个单词记忆助手，根据用户信息和单词记录，生成单词记忆报告',
      });
      const result = await agent.invoke({
        messages: [
          {
            role: 'user',
            content: `查询用户信息,并且根据用户id关联单词记录表，查询出用户今天的单词记录,用户id: ${user.id}，过滤掉敏感信息`,
          },
        ],
      });
      const content = result.messages.at(-1)?.content;
      if (content) {
        const html = await marked.parse(content as string);
        const [hour, minute, second] = user.timingTaskTime
          .split(':')
          .map(Number);
        const target = dayjs()
          .startOf('day')
          .set('hour', hour)
          .set('minute', minute)
          .set('second', second);
        let delay = target.diff(dayjs());
        if (delay < 0) {
          delay = 0;
        }
        await this.digestQueue.add(
          digestQueueName.task.emailDigest,
          {
            userId: user.id,
            text: html,
            email: user.email,
          },
          {
            delay: delay,
          },
        );
      }
    }
  }
}
