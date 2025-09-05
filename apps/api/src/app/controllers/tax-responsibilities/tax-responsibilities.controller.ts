import { Controller, Get } from '@nestjs/common';
import { TaxResponsibilitiesService } from '../../models/tax-responsibilities';

@Controller('tax-responsibilities')
export class TaxResponsibilitiesController {
  constructor(private readonly _taxResponsibilitiesService: TaxResponsibilitiesService) { }

  @Get()
  public async getAll() {
    const list = await this._taxResponsibilitiesService.getTaxResponsibilities();
    return {
      data: list,
    };
  }
}
