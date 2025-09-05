import { Controller, Get } from '@nestjs/common';
import { CiiuService } from '../../models/ciiu';

@Controller('ciiu')
export class CiiuController {
  constructor(private readonly _ciiuService: CiiuService) { }

  @Get()
  public async getAll() {
    const list = await this._ciiuService.getCodes();
    return {
      data: list,
    };
  }
}
