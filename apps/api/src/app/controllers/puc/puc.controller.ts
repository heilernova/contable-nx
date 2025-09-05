import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PucService } from '../../models/puc';

@Controller('puc')
export class PucController {
  constructor(
    private readonly _pucService: PucService,
  ) { }

  @Get()
  public async getAll(@Query() params: { search?: string }) {
    const list = await this._pucService.getAll({ search: params.search });
    return {
      results: list.length,
      data: list,
    };
  }

  @Get(':id')
  public async getById(@Param('id') id: string) {
    const account = await this._pucService.getById(id);
    if (!account) {
      throw new NotFoundException({ message: 'Cuenta no encontrada.' })
    }

    const parent = await this._pucService.getParent(id);

    return {
      data: {
        account,
        parent,
      }
    };
  }
}
