import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/db-connection';

type PUCEntry = {
  code: string;
  name: string;
};

@Injectable()
export class PucService {
  private pucData: PUCEntry[] = [];
  constructor(
    private readonly _dbConnectionService: DbConnectionService
  ) {}

  public async getAll(refresh?: boolean) {
    if (!refresh && this.pucData.length > 0) {
      return this.pucData;
    }
    const rows: PUCEntry[] = (await this._dbConnectionService.query('SELECT * FROM data_puc')).rows;
    this.pucData = rows;
    return rows;
  }

  public async update(code: string, name: string): Promise<boolean> {
    const result = await this._dbConnectionService.query('UPDATE data_puc SET name = $1 WHERE code = $2 RETURNING *', [name, code]);
    const updatedRow: PUCEntry | null = result.rows[0] ?? null;
    if (!updatedRow) {
      return false;
    }
    const index = this.pucData.findIndex(item => item.code === code);
    if (index !== -1) {
      this.pucData[index] = updatedRow;
    } else {
      await this.getAll();
    }

    return true;
  }
}
