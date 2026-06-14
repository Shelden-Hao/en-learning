import type {
  Token,
  UserLogin,
  UserRegister,
  UserUpdate,
} from '@en-learning/common/user';
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //登录
  @Post('login')
  login(@Body() createUserDto: UserLogin) {
    return this.userService.login(createUserDto);
  }
  //注册
  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }

  // 刷新token
  @Post('refresh-token')
  refreshToken(@Body() createUserDto: Omit<Token, 'accessToken'>) {
    return this.userService.refreshToken(createUserDto);
  }

  //上传头像
  @UseGuards(AuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file')) // 限制前端上传文件的 key 必须是 file
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }

  //更新用户信息
  @UseGuards(AuthGuard)
  @Post('update-user')
  updateUser(@Body() createUserDto: UserUpdate, @Req() req: Request) {
    // 这里需要为 Request 扩种类型（Express 扩充类型）
    const user = req.user;
    return this.userService.updateUser(createUserDto, user);
  }
}
