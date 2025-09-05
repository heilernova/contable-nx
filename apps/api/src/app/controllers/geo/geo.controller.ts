import { Controller, Get } from '@nestjs/common';
import { GeoService } from '../../models/geo/geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly _geoService: GeoService) { }

  @Get()
  public async getAll() {
    const list = await this._geoService.getDepartments(true);
    return {
      data: list,
    };
  }
}
