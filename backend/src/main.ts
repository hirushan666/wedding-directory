import { NestFactory } from '@nestjs/core';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { SanitizePayloadInterceptor } from './common/interceptors/sanitize-payload.interceptor';
// main.ts — very top, before other imports
import * as dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'https://sayido.lk',
  'https://sayido-eta.vercel.app',
  'https://sayido.duckdns.org',
  'https://sayido.easycase.site',
  'https://api.sayido.easycase.site',
  'https://wedding-directory-two.vercel.app',
];

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const PRIVATE_LAN_ORIGIN_REGEX =
  /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/i;

const parseAllowedOrigins = () => {
  const fromEnv = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...fromEnv]));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = parseAllowedOrigins();

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        // Native apps and some tools do not always send Origin.
        callback(null, true);
        return;
      }

      if (
        allowedOrigins.includes(origin) ||
        LOCALHOST_ORIGIN_REGEX.test(origin) ||
        PRIVATE_LAN_ORIGIN_REGEX.test(origin) ||
        origin.endsWith('.easycase.site') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Global Layer 3: Payload sanitization (strips null bytes, control chars, limits payload ceiling)
  app.useGlobalInterceptors(new SanitizePayloadInterceptor());

  // Global Layer 4: Field-level validation and sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const fieldName = (firstError?.property || 'Field')
          .replace(/_/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2');
        const constraints = firstError?.constraints || {};

        let friendlyMessage = `${fieldName} is invalid.`;
        if (constraints.maxLength) {
          friendlyMessage = `${fieldName} exceeds the maximum allowed length.`;
        } else if (constraints.minLength) {
          friendlyMessage = `${fieldName} is too short.`;
        } else if (constraints.isEmail) {
          friendlyMessage = `Please enter a valid email address.`;
        } else if (constraints.isString) {
          friendlyMessage = `${fieldName} must be valid text.`;
        }

        return new BadRequestException(friendlyMessage);
      },
    }),
  );

  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`Backend listening on http://${host}:${port}`);
}

bootstrap();
