import { Module } from '@nestjs/common';
import { BasicAuthModule } from './basic_auth/basic-auth.module';

@Module({
  imports: [BasicAuthModule],
  providers: [],
  controllers: [],
})
export class AuthModule {}
