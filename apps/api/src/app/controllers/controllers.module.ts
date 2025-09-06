import { Module } from '@nestjs/common';
import { PucController } from './puc/puc.controller';
import { TaxResponsibilitiesController } from './tax-responsibilities/tax-responsibilities.controller';
import { CiiuController } from './ciiu/ciiu.controller';
import { GeoController } from './geo/geo.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  controllers: [
    PucController,
    TaxResponsibilitiesController,
    CiiuController,
    GeoController,
    AuthController
  ]
})
export class ControllersModule {}
