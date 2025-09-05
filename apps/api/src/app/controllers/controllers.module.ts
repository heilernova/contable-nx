import { Module } from '@nestjs/common';
import { PucController } from './puc/puc.controller';
import { TaxResponsibilitiesController } from './tax-responsibilities/tax-responsibilities.controller';

@Module({
  controllers: [
    PucController,
    TaxResponsibilitiesController
  ]
})
export class ControllersModule {}
