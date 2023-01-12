import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  MicroserviceOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { RmqService, USER_SERVICE } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const configService = app.get(ConfigService);
  const rmqService = app.get(RmqService);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  useContainer(app.select(UserServiceModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('User microservice')
    .setDescription('REST API Documentation')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/user-service/docs', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get('USER_SERVICE_HOST'),
      port: configService.get('USER_SERVICE_PORT'),
    },
  });

  app.connectMicroservice<RmqOptions>(
    rmqService.getOptions(USER_SERVICE, true),
  );

  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
