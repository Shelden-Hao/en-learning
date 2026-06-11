import { Injectable } from '@nestjs/common';
import type {
  RefreshTokenPayload,
  Token,
  UserLogin,
  UserRegister,
} from '@en-learning/common/user';
import { PrismaService, ResponseService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true,
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  //登录
  async login(createUserDto: UserLogin) {
    //1. 检查是手机号是否存在
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone, //查询手机号
      },
    });
    if (!user) {
      return this.responseService.error(null, '手机号不存在');
    }
    //2. 检查密码是否正确
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null, '密码不正确');
    }
    //3. 查询用户信息 更新最后登录时间
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.id, //查询用户ID
      },
      data: {
        lastLoginAt: new Date(), //最后登录时间
      },
      select: userSelect,
    });
    // 4. 生成token
    const token = this.authService.generateToken({
      userId: updateUser.id,
      email: updateUser.email,
      name: updateUser.name,
    });
    return this.responseService.success({
      ...updateUser,
      token,
    });
  }
  //注册 Primsa 所有的API都是异步的
  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(), //最后登录时间，这里是为了给前端使用
    };

    //1. 如果手机号已经存在则返回错误
    //findUnique 只能查询数据是唯一的
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone, //查询手机号
      },
    });
    if (user) {
      return this.responseService.error(null, '手机号已经存在');
    }
    //2. 判断一下邮箱如果他传入了 并且存在了也不行的说明重复了
    if (createUserDto.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email, //查询邮箱
        },
      });
      if (emailUser) {
        return this.responseService.error(null, '邮箱已经存在');
      }
      data.email = createUserDto.email;
    }
    //3. 创建用户 默认他是把所有的值全部返回（包括密码），所以我们需要排除掉密码（prisma 内部没有排除，只有选择）
    const newUser = await this.prisma.user.create({
      data,
      select: userSelect,
    });
    //4. 生成token
    const token = this.authService.generateToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    return this.responseService.success({
      ...newUser,
      token,
    });
  }
  //刷新token
  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    //1. 检查token是否过期
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        createUserDto.refreshToken,
      );
      // 防止使用 accessToken 冒充刷新token 进行攻击
      if (decoded.tokenType !== 'refresh') {
        return this.responseService.error(null, '刷新token过期');
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.userId, //查询用户ID
        },
      });
      // 检查用户是否存在，如果不存在说明 userId 是伪造的
      if (!user) {
        return this.responseService.error(null, '刷新不存在');
      }
      // 生成新的 refreshToken 和 accessToken
      const token = this.authService.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      return this.responseService.success(token);
    } catch (error) {
      return this.responseService.error(null, '刷新token过期');
    }
  }
}
