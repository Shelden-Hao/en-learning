import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import type { WordQuery } from '@en-learning/common/word';
import { AuthGuard } from '@libs/shared/auth/auth.guard';

@Controller('word-book')
export class WordBookController {
  constructor(private readonly wordBookService: WordBookService) {}

  @UseGuards(AuthGuard) // 哪个接口需要登录鉴权就添加这个装饰器
  @Get()
  findAll(@Query() query: WordQuery) {
    return this.wordBookService.findAll(query);
  }
}
