import { Injectable } from '@nestjs/common';
import { DbConnectionService } from '../../common/db-connection';

export type UNSPSCSegment = {
  code: string;
  name: string;
}

export type UNSPSCFamily = {
  code: string;
  segmentCode: string;
  name: string;
}
export type UNSPSCClass = {
  code: string;
  familyCode: string;
  name: string;
}
export type UNSPSCCode = {
  code: string;
  classCode: string;
  name: string;
}


@Injectable()
export class UnspscService {
  private codesCache: UNSPSCCode[] = [];
  private familiesCache: UNSPSCFamily[] = [];
  private segmentsCache: UNSPSCSegment[] = [];
  private classesCache: UNSPSCClass[] = [];

  constructor(private readonly dbConnectionService: DbConnectionService) {}

  public async getSegments(refresh?: boolean): Promise<UNSPSCSegment[]> {
    if (this.segmentsCache.length === 0 || refresh) {
      const rows: UNSPSCSegment[] = (await this.dbConnectionService.query('SELECT code, name FROM data_unspsc_segments')).rows;
      this.segmentsCache = rows;
    }
    return this.segmentsCache;
  }

  public async getFamilies(refresh?: boolean): Promise<UNSPSCFamily[]> {
    if (this.familiesCache.length === 0 || refresh) {
      const rows: UNSPSCFamily[] = (await this.dbConnectionService.query('SELECT code, segment_code AS "segmentCode", name FROM data_unspsc_families')).rows;
      this.familiesCache = rows;
    }
    return this.familiesCache;
  }

  public async getClasses(refresh?: boolean): Promise<UNSPSCClass[]> {
    if (this.classesCache.length === 0 || refresh) {
      const rows: UNSPSCClass[] = (await this.dbConnectionService.query('SELECT code, family_code AS "familyCode", name FROM data_unspsc_classes')).rows;
      this.classesCache = rows;
    }
    return this.classesCache;
  }
  public async getCodes(refresh?: boolean): Promise<UNSPSCCode[]> {
    if (this.codesCache.length === 0 || refresh) {
      const rows: UNSPSCCode[] = (await this.dbConnectionService.query('SELECT code, class_code AS "classCode", name FROM data_unspsc_codes')).rows;
      this.codesCache = rows;
    }
    return this.codesCache;
  }

}
