/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export class PostgreSQLQueries {
  protected _connection: Pool | PoolClient;
  protected _writing: 'camel' | 'snake' | null;

  constructor(connection: Pool | PoolClient,  writing?: 'camel' | 'snake') {
    this._connection = connection;
    this._writing = writing || null;
  }

  camelToSnake(camelCaseString: string): string {
    const snakeCaseString = camelCaseString.replace(/([A-Z])/g, '_$1').toLowerCase();
    return snakeCaseString.startsWith('_') ? snakeCaseString.slice(1) : snakeCaseString;
  }

  public snakeToCamel(snakeCaseString: string) {
    const words = snakeCaseString.split('_');
    const camelCaseWords = words.map((word, index) => {
      if (index === 0) {
        return word;
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    });
    return camelCaseWords.join('');
  }

  public parseColumnName(name: string): string {
    if (this._writing === 'snake') {
      return this.camelToSnake(name);
    } else if (this._writing === 'camel') {
      return this.snakeToCamel(name);
    }
    return this.snakeToCamel(name);
  }

  async query<T extends QueryResultRow = any>(sql: string, params?: unknown[], arrayMode?: false): Promise<QueryResult<T>>;
  async query<T extends unknown[] = unknown[]>(sql: string, params?: unknown[], arrayMode?: true): Promise<QueryResult<T>>;
  public query(sql: string, params?: unknown[], arrayMode?: boolean) {
    if (arrayMode) {
      return this._connection.query({ text: sql, values: params, rowMode: 'array' });
    } else {
      return this._connection.query({ text: sql, values: params });
    }
  }

  public insert<T extends QueryResultRow = any>(options: { table: string; data: Record<string, any>; returning?: string[] | string }): Promise<QueryResult<T>> {
    const { table, data, returning } = options;
    const columns = Object.keys(data).filter((key) => data[key] !== undefined).map((key) => this.parseColumnName(key));
    const values = Object.values(data).filter((value) => value !== undefined);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const returningArray = Array.isArray(returning) ? returning : returning ? [returning] : [];
    const sql = `INSERT INTO ${table} ("${columns.join('", "')}") VALUES (${placeholders})${returningArray.length > 0 ? ` RETURNING ${returningArray.map((key) => this.parseColumnName(key)).join(', ')}` : ''}`;
    return this.query(sql, values);
  }

  public update<T extends QueryResultRow = any>(options: { table: string; data: Record<string, any>; condition: string; conditionParams?: unknown[]; returning?: string[] | string }): Promise<QueryResult<T>> {
    const { table, data, condition, conditionParams = [], returning } = options;
    const setClause = Object.keys(data)
      .filter((key) => data[key] !== undefined)
      .map((key, index) => `${this.parseColumnName(key)} = $${index + 1 + conditionParams.length}`)
      .join(', ');
    const values = Object.values(data).filter((value) => value !== undefined);

    const returningArray = Array.isArray(returning) ? returning : returning ? [returning] : [];
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${condition}${returningArray.length > 0 ? ` RETURNING ${returningArray.map((key) => this.parseColumnName(key)).join(', ')}` : ''}`;
    return this.query(sql, [...conditionParams, ...values]);
  }

  public delete(options: { table: string; condition: string; conditionParams?: unknown[]; returning?: string[] | string }): Promise<QueryResult> {
    const { table, condition, conditionParams = [], returning } = options;

    const returningArray = Array.isArray(returning) ? returning : returning ? [returning] : [];
    const sql = `DELETE FROM ${table} WHERE ${condition}${returningArray.length > 0 ? ` RETURNING ${returningArray.map((key) => this.parseColumnName(key)).join(', ')}` : ''}`;
    return this.query(sql, conditionParams);
  }
}
