import { RefreshTokenPayload, TokenPayload } from '@en-learning/common/user';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  generateToken(payload: TokenPayload) {
    return {
      // 访问令牌 用于用户登录后进行请求时验证身份 过期时间为10秒（很快，方便测试）
      accessToken: this.jwtService.sign<RefreshTokenPayload>({
        ...payload,
        tokenType: 'access',
        // 不手动写 expiresIn， JwtService 会自动添加 expiresIn 选项，默认使用注册 JwtService 的 expiresIn 选项
      }),
      // 刷新令牌 用于用户在访问令牌过期后重新获取新的访问令牌（过期时间为 7 天）
      refreshToken: this.jwtService.sign<RefreshTokenPayload>(
        {
          ...payload,
          tokenType: 'refresh',
        },
        {
          expiresIn: '7d',
        },
      ),
    };
  }
}
