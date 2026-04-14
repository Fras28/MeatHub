import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    bufferLogs: true,
    rawBody: true,   // Necesario para verificar la firma HMAC del webhook de Mercado Pago
  });

  const isDev = process.env.NODE_ENV !== 'production';

  // ─────────────────────────────────────────────
  // 1. HELMET — HTTP Security Headers
  // ─────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: isDev
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          },
      hsts: {
        maxAge: 31536000,   // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: false,
      crossOriginEmbedderPolicy: !isDev,
    }),
  );

  // ─────────────────────────────────────────────
  // 2. CORS — solo orígenes permitidos
  // ─────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 3600,
  });

  // ─────────────────────────────────────────────
  // 3. Global Prefix
  // ─────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─────────────────────────────────────────────
  // 4. Validation Pipe — whitelist + transform
  // ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // strip unknown properties
      forbidNonWhitelisted: true,   // throw if unknown properties are present
      transform: true,              // auto-transform types
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: !isDev, // hide error details in production
    }),
  );

  // ─────────────────────────────────────────────
  // 5. Global Exception Filter
  // ─────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─────────────────────────────────────────────
  // 6. Global Interceptors
  //    Order matters: Logging → Transform → Serializer
  // ─────────────────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // ─────────────────────────────────────────────
  // 7. Swagger (solo en desarrollo)
  // ─────────────────────────────────────────────
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('RESERA API')
      .setDescription(
        'Marketplace B2B del mercado cárnico argentino — Sistema de gestión crediticia y pagos descentralizados',
      )
      .setVersion(process.env.APP_VERSION ?? '1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('listings', 'Publicaciones de reses y lotes')
      .addTag('orders', 'Pedidos y señas')
      .addTag('scoring', 'Sistema de scoring crediticio')
      .addTag('ratings', 'Calificaciones bidireccionales')
      .addTag('payments', 'Pagos Mercado Pago')
      .addTag('admin', 'Panel de administración')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(process.env.SWAGGER_PATH ?? 'docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log(`📖 Swagger disponible en: /docs`);
  }

  // ─────────────────────────────────────────────
  // 8. Start
  // ─────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);

  logger.log(`🥩 RESERA API corriendo en: http://localhost:${port}/api/v1`);
  logger.log(`🌍 Entorno: ${process.env.NODE_ENV ?? 'development'}`);
  logger.log(`🔒 CORS habilitado para: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch((err: unknown) => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
});
