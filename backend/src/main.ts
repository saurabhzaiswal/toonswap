import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(
    helmet({
      // This process serves JSON/media APIs, not HTML documents.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      strictTransportSecurity: isProduction
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );
  app.use(cookieParser());

  const configuredOrigins = process.env.FRONTEND_ORIGIN?.trim();
  if (isProduction && !configuredOrigins)
    throw new Error('FRONTEND_ORIGIN is required in production');
  const allowedOrigins = new Set(
    (configuredOrigins || 'http://localhost:5173,http://localhost:4173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      // Requests without Origin are server-to-server/native calls and still need authentication.
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-ToonSwap-CSRF', 'X-ToonSwap-Login-CSRF'],
    maxAge: 600,
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = process.env.PORT ?? 3000;
  app.enableShutdownHooks();
  await app.listen(port);
  console.log(`ToonSwap backend running on :${port}`);
}
bootstrap();
