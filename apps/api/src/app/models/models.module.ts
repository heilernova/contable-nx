import { Global, Module } from '@nestjs/common';
import { PucService } from './puc/puc.service';

const services = [
  PucService
];

@Global()
@Module({
  providers: services,
  exports: services
})
export class ModelsModule {}
