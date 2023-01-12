import { HashService } from './hash.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [HashService],
  controllers: [],
  exports: [HashService],
})
export class HashModule {}
