import {
  UnprocessableEntityException,
  ValidationPipe,
  type INestApplication,
  type ValidationError,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  getUploadsDir,
  UPLOADS_ROUTE,
} from '../posts/thumbnail-storage.service.js';

export function configureApp(app: INestApplication): void {
  (app as NestExpressApplication).useStaticAssets(getUploadsDir(), {
    prefix: UPLOADS_ROUTE,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new UnprocessableEntityException({
          statusCode: 422,
          message: 'Validation failed',
          errors: errors.map((error) => ({
            field: error.property,
            messages: Object.values(error.constraints ?? {}),
          })),
        }),
    }),
  );
}
