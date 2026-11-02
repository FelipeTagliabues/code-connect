import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { configureApp } from './common/configure-app.js';

async function bootstrap() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription('Cadastro, login, posts, curtidas e comentários')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
