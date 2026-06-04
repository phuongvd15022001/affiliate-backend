import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all.exceptions.filter';
import { InvalidFormExceptionFilter } from './filters/invalid.form.exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from 'cors';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Exception
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost)),
    new InvalidFormExceptionFilter(),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Nest App Base')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Cors
  app.use(
    cors({
      origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
