import {NestFactory} from '@nestjs/core';
import {AppModule} from './modules/app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const port = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('Task Runner API')
    .setDescription('API for managing asynchronous computational tasks')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api-docs`);
}
bootstrap();
