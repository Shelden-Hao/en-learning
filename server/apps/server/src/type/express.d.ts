import type { TokenPayload } from '@en-learning/common/user';

// 全局扩充类型，方便 Request 可以读取到 user
declare module 'express' {
  interface Request {
    user: TokenPayload;
  }
}
