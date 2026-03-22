import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { NestFactory }            from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule }              from './app.module';

async function bootstrap() {
  try {
    const app    = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    app.enableCors();

    app.setGlobalPrefix('api', {
      exclude: ['docs', 'docs-json'],
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }));

    // Swagger 
    const config = new DocumentBuilder()
      .setTitle('Artist Management System')
      .setDescription('API documentation for managing Users, Artists, and Music')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          name:         'Authorization',
          in:           'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    // listen (init happens here automatically)
    await app.listen(process.env.PORT ?? 3000);
    logger.log(`http://localhost:${process.env.PORT ?? 3000}/api/v1`);
    logger.log(`http://localhost:${process.env.PORT ?? 3000}/docs`);

  } catch (err) {
    console.error('Bootstrap failed:', err.message);
    process.exit(1);
  }
}

bootstrap();