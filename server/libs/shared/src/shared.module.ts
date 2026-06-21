import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from './minio/minio.module';
import { PayModule } from './pay/pay.module';
import { EmailModule } from './email/email.module';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  providers: [SharedService],
  exports: [
    SharedService,
    PrismaModule,
    ResponseModule,
    JwtModule,
    ConfigModule,
    MinioModule,
    PayModule,
    EmailModule,
  ],
  imports: [
    PrismaModule,
    ResponseModule,
    ConfigModule.forRoot({
      // NestJS 容器会读取 .env 文件，解析环境变量，并将这些数据保存在它所管理的 ConfigService 单例对象
      isGlobal: true, // 全局配置
      envFilePath: '.env', // 环境变量位置
      // 当配置 envFilePath: '.env' 时，它实际上是去读取路径为 process.cwd() + '/.env' 的文件
      // 用命令行启动一个 Node.js 应用时（比如在 server 目录下执行 npm run start），process.cwd() 就是启动 NestJS 服务的根目录
    }),
    // JwtModule 的初始化强依赖于环境变量 JWT_SECRET，这意味着 ConfigModule 必须在 JwtModule 初始化之前先准备好，因此使用异步注册
    // 等待 inject 数组里的依赖（ConfigService）完全准备好之后，再把这个依赖作为参数（configService）传入 useFactory 工厂函数中，最后用这个函数的返回值来初始化 JwtModule。
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // 获取初始化好的、带有环境变量数据的那个单例 ConfigService 实例
      inject: [ConfigService],
      // 由于依赖注入容器化框架系统的缘故，我们不能手动使用 new 关键字去实例化 Service
      // 否则得到的只是一个全新的、空的、没有经过 NestJS 初始化的对象，里面没有 .env 数据
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '10s' }, // 过期时间 这里写10s主要是方便测试
      }),
    }),
    MinioModule,
    PayModule,
    EmailModule,
    BullModule.forRootAsync({
      // 为了使用环境变量，所以需要使用工厂模式来引入
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
      }),
    }),
  ],
})
export class SharedModule {}
