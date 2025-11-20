import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000'],

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}
bootstrap();
