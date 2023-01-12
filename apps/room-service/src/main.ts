import { NestFactory } from '@nestjs/core';
import { RoomServiceModule } from './room-service.module';
import { RmqService, ROOM_SERVICE } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(RoomServiceModule);
  const rmqService = app.get<RmqService>(RmqService);

  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  useContainer(app.select(RoomServiceModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Room microservice')
    .setDescription('REST API Documentation')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/room-service/docs', app, document);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get('ROOM_SERVICE_HOST'),
      port: configService.get('ROOM_SERVICE_PORT'),
    },
  });

  app.connectMicroservice(rmqService.getOptions(ROOM_SERVICE));

  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
