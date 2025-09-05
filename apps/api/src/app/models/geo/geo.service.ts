import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/db-connection';

@Injectable()
export class GeoService {
  constructor(
      private readonly _dbConnection: DbConnectionService
    ) {}
  
    public async getDepartments(withCities: true): Promise<{ code: string, name: string, cities: { code: string, name: string }[] }[]>
    public async getDepartments(withCities: false): Promise<{ code: string, name: string }[]>
    public async getDepartments(withCities?: boolean): Promise<({ code: string, name: string } | { code: string, name: string, cities: { code: string, name: string }[] })[]> {
      let sql = `
        SELECT code, name
        FROM data_location_departments
        ORDER BY name
      `;
      if (withCities) {
        sql = `
          SELECT d.code, d.name, 
            COALESCE(json_agg(
              jsonb_build_object(
                'code', c.code,
                'name', c.name
              ) ORDER BY c.name
            ) FILTER (WHERE c.code IS NOT NULL), '[]') AS cities
          FROM data_geo_departments d
          LEFT JOIN data_geo_municipalities c ON c.department_code = d.code
          GROUP BY d.code, d.name;
        `;
      }
      const rows = (await this._dbConnection.query(sql)).rows;
      return rows;
    } 
}
