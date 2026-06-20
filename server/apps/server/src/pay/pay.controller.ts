import { Controller, Post, Body, UseGuards, Req, All } from '@nestjs/common';
import { PayService } from './pay.service';
import type { CreatePayDto } from '@en-learning/common/pay';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() createPayDto: CreatePayDto, @Req() req: Request) {
    const user = req.user;
    return this.payService.create(createPayDto, user);
  }

  @All('notify') // 不知道具体请求方法使用 All 都可以接收
  notify(@Req() req: Request) {
    return this.payService.notify(req);
  }
}
