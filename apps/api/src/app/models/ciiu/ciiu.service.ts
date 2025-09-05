import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/db-connection';

export type CIIUCode = {
  code: string;
  groupCode: string;
  description: string;
};

export type CIIUGroup = {
  code: string;
  divisionCode: string;
  description: string;
};

export type CIIUDivision = {
  sectionCode: string;
  code: string;
  description: string;
};

export type CIIUSection = {
  code: string;
  description: string;
};


@Injectable()
export class CiiuService {
  private codesCache: CIIUCode[] = [];
  private groupsCache: CIIUGroup[] = [];
  private divisionsCache: CIIUDivision[] = []
  private sectionsCache: CIIUSection[] = [];
  constructor(
    private readonly _dbConnectionService: DbConnectionService
  ) {}

  public async getCodes(refresh?: boolean): Promise<CIIUCode[]> {
    if (!refresh && this.codesCache.length) {
      return this.codesCache;
    }
    const rows: CIIUCode[] = (await this._dbConnectionService.query('SELECT code, group_code as "groupCode", description FROM data_ciiu_codes ORDER BY code')).rows;
    this.codesCache = rows;
    return rows;
  }

  public async getGroups(refresh?: boolean): Promise<CIIUGroup[]> {
    if (!refresh && this.groupsCache.length) {
      return this.groupsCache;
    }
    const rows: CIIUGroup[] = (await this._dbConnectionService.query('SELECT code, division_code as "divisionCode", description FROM data_ciiu_groups ORDER BY code')).rows;
    this.groupsCache = rows;
    return rows;
  }

  public async getDivisions(refresh?: boolean): Promise<CIIUDivision[]> {
    if (!refresh && this.divisionsCache.length) {
      return this.divisionsCache;
    }
    const rows: CIIUDivision[] = (await this._dbConnectionService.query('SELECT section_code as "sectionCode", code, description FROM data_ciiu_divisions ORDER BY code')).rows;
    this.divisionsCache = rows;
    return rows;
  }

  public async getSections(refresh?: boolean): Promise<CIIUSection[]> {
    if (!refresh && this.sectionsCache.length) {
      return this.sectionsCache;
    }
    const rows: CIIUSection[] = (await this._dbConnectionService.query('SELECT code, description FROM data_ciiu_sections ORDER BY code')).rows;
    this.sectionsCache = rows;
    return rows;
  }
}