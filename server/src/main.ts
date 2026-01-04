import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  // Logger
  const logger = new Logger('Bootstrap');

  // Create app
  const app = await NestFactory.create(AppModule);

  // Config service
  const configService = app.get(ConfigService);

  // Set global prefix
  const apiPrefix = configService.getOrThrow<string>('API_PREFIX');
  const apiVersion = configService.getOrThrow<string>('API_VERSION');
  const globalPrefix = `${apiPrefix}/${apiVersion}`;
  app.setGlobalPrefix(globalPrefix);

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global cors
  const clientUrl = configService.getOrThrow<string>('CLIENT_URL');
  app.enableCors({
    origin: clientUrl,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true,
  });

  // Set global cookie parser
  app.use(cookieParser());

  // Set global helmet
  app.use(helmet());

  // Set global swagger
  if (configService.getOrThrow<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Court Booking System API')
      .setDescription('API documentation for Sport Court Booking System')
      .setVersion(apiVersion)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  }

  // Set global port
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);

  // Log
  const appUrl = await app.getUrl();
  logger.log(`Application is running on: ${appUrl}/${globalPrefix}`);
  logger.log(`Accepting requests from: ${clientUrl}`);
  if (configService.getOrThrow<string>('NODE_ENV') !== 'production') {
    logger.log(`Swagger Docs available at: ${appUrl}/${globalPrefix}/docs`);
  }
}
bootstrap();
