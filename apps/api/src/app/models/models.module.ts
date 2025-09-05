import { Global, Module } from '@nestjs/common';
import { PucService } from './puc/puc.service';
import { CiiuService } from './ciiu/ciiu.service';
import { UnspscService } from './unspsc/unspsc.service';

const services = [
  PucService,
  CiiuService,
  UnspscService
];

@Global()
@Module({
  providers: services,
  exports: services
})
export class ModelsModule {}
