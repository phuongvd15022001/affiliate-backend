import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/filters/all.exceptions.filter';
import { InvalidFormExceptionFilter } from '../src/filters/invalid.form.exception.filter';
import cors from 'cors';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';

function normalizeJsonLiteralNewlines(raw: string): string {
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      result += ch;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString && ch === '\r') {
      result += '\\n';
      if (raw[i + 1] === '\n') i++;
      continue;
    }
    if (inString && ch === '\n') {
      result += '\\n';
      continue;
    }
    result += ch;
  }
  return result;
}

const server = express();
let initialized = false;

async function bootstrap() {
  if (initialized) return;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
  });

  app.use(express.raw({ type: 'application/json', limit: '10mb' }));
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(
          normalizeJsonLiteralNewlines(req.body.toString('utf8')),
        ) as unknown;
      } catch (err) {
        return next(err);
      }
    }
    next();
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost)),
    new InvalidFormExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Affiliate API')
    .setDescription('Shopee Affiliate Link Processor')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.use(
    cors({
      origin: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  await app.init();
  initialized = true;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  await bootstrap();
  server(req, res);
}
