import { NestFactory } from '@nestjs/core';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'https://sayido.lk',
  'https://sayido-eta.vercel.app',
  'https://sayido.duckdns.org',
  'https://sayido.easycase.site',
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
        PRIVATE_LAN_ORIGIN_REGEX.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`Backend listening on http://${host}:${port}`);
}

bootstrap();
