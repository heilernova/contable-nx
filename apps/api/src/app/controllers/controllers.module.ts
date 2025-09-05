import { Module } from '@nestjs/common';
import { PucController } from './puc/puc.controller';
import { TaxResponsibilitiesController } from './tax-responsibilities/tax-responsibilities.controller';
import { CiiuController } from './ciiu/ciiu.controller';

@Module({
  controllers: [
    PucController,
    TaxResponsibilitiesController,
    CiiuController
  ]
})
export class ControllersModule {}
