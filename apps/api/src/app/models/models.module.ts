import { Global, Module } from '@nestjs/common';
import { PucService } from './puc/puc.service';
import { CiiuService } from './ciiu/ciiu.service';

const services = [
  PucService,
  CiiuService
];

@Global()
@Module({
  providers: services,
  exports: services
})
export class ModelsModule {}
