import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      //forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  //await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}

bootstrap();
