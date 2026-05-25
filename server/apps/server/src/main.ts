import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from '@en-learning/config';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.setGlobalPrefix('api'); // 设置全局前缀
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' }); // 设置版本号
  await app.listen(Config.ports.server);
}
bootstrap();
