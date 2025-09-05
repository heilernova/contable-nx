import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/db-connection';

export type TaxResponsibility = {
  code: string;
  name: string;
  description: string | null;
}

@Injectable()
export class TaxResponsibilitiesService {
  private taxResponsibilitiesCache: TaxResponsibility[] = [];
  constructor(
    private readonly _dbConnection: DbConnectionService
  ) {}

  public async getTaxResponsibilities(refresh?: boolean): Promise<TaxResponsibility[]> {
    if (this.taxResponsibilitiesCache.length === 0 || refresh) {
      const rows: TaxResponsibility[] = (await this._dbConnection.query('SELECT code, name, description FROM data_tax_responsibilities')).rows;
      this.taxResponsibilitiesCache = rows;
    }
    return this.taxResponsibilitiesCache
  }
}
