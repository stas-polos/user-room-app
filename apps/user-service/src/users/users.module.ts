import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RmqModule } from '@app/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RmqModule],
  providers: [
    UsersService,
    {
      provide: 'TCP_ROOM_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ROOM_SERVICE_HOST'),
            port: configService.get('ROOM_SERVICE_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
