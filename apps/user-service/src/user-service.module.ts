import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation-schema.config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HashModule } from './hash/hash.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/user-service/.env',
      isGlobal: true,
      validationSchema,
    }),
    UsersModule,
    AuthModule,
    DatabaseModule,
    HashModule,
  ],
  controllers: [],
  providers: [],
})
export class UserServiceModule {}
