import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [SharedModule], // 引入 SharedModule，以便使用 JwtService 等服务
  providers: [AuthService],
  exports: [AuthService], // 导出 AuthService，方便其他模块注入
})
export class AuthModule {}
