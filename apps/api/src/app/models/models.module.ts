import { Global, Module } from '@nestjs/common';
import { PucService } from './puc/puc.service';
import { CiiuService } from './ciiu/ciiu.service';
import { UnspscService } from './unspsc/unspsc.service';
import { TaxResponsibilitiesService } from './tax-responsibilities/tax-responsibilities.service';
import { GeoService } from './geo/geo.service';

const services = [
  PucService,
  CiiuService,
  UnspscService,
  TaxResponsibilitiesService,
  GeoService
];

@Global()
@Module({
  providers: services,
  exports: services
})
export class ModelsModule {}
