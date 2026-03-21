import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 1. Setup Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Artist Management System')
    .setDescription('API documentation for managing Users, Artists, and Music')
    .setVersion('1.0')
    .addBearerAuth() // This is for JWT later
    .build();

  // 2. Create Document
  const document = SwaggerModule.createDocument(app, config);

  // 3. Setup Swagger UI at /api
  SwaggerModule.setup('api', app, document);

  // Enable CORS so your React frontend can connect later
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
