import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/db-connection';

type PUCEntry = {
  code: string;
  name: string;
  normalizedName: string; // Normalized text for search
};

@Injectable()
export class PucService {
  private pucData: PUCEntry[] = [];
  constructor(
    private readonly _dbConnectionService: DbConnectionService
  ) {}

  public async getAll(options?: { refresh?: boolean, search?: string }): Promise<PUCEntry[]> {
  
    if (options.refresh || this.pucData.length === 0) {
      const rows: PUCEntry[] = (await this._dbConnectionService.query<{ code: string, name: string }>('SELECT code, name FROM data_puc')).rows.map(row => ({
        code: row.code,
        name: row.name,
        normalizedName: row.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
      }));
      this.pucData = rows;
    }

    if (options?.search) {
      
      const search = options.search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      if (/^[0-9]+$/.test(search)){
        return this.pucData.filter(x => x.code.startsWith(search) && x.code.length >= search.length);
      } else {
        const texts = search.split(" ").map(x=> x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        return this.pucData.filter(x => texts.every(val => x.normalizedName.includes(val)))
      }
    }

    return this.pucData;
  }

  public async getById(code: string): Promise<PUCEntry | null> {
    return (await this._dbConnectionService.query('SELECT code, name FROM data_puc WHERE code = $1', [code])).rows[0] ?? null;
  }

  public async getParent(code: string): Promise<PUCEntry[]> {
    const pairs = this.splitInPairs(code);
    const list: string[] = [];
    pairs.forEach(part => {
      const last = list[list.length - 1] || '';
      list.push(last + part);
    });
    if (code.length > 1) {
      list.unshift(code.substring(0, 1));
    }

    const parent = await this._dbConnectionService.query('SELECT code, name FROM data_puc WHERE code = ANY($1) ORDER BY code ASC', [list]);
    return parent.rows ?? [];
  }

  private splitInPairs(str: string): string[] {
    return str.match(/.{1,2}/g) || [];
  }

  public async update(code: string, name: string): Promise<boolean> {
    const result = await this._dbConnectionService.query('UPDATE data_puc SET name = $1 WHERE code = $2 RETURNING *', [name, code]);
    const updatedRow: { name: string, code: string } | null = result.rows[0] ?? null;
    if (!updatedRow) {
      return false;
    }
    const index = this.pucData.findIndex(item => item.code === code);
    if (index !== -1) {
      this.pucData[index] = {
        code: updatedRow.code,
        name: updatedRow.name,
        normalizedName: updatedRow.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
      };
    } else {
      await this.getAll();
    }

    return true;
  }
}
