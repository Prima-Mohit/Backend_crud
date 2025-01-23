import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/Response.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalLogger = new Logger('NestApplication');
  globalLogger.log('Application is bootstrapping...');
  app.useGlobalInterceptors(new ResponseInterceptor(), new ErrorInterceptor());
  await app.listen(3000);
  globalLogger.log(
    `Nest application successfully started on http://localhost:3000`,
  );
}
// Use both interceptors globally

bootstrap();
