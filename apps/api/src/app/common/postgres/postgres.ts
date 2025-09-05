import { Pool } from "pg";
import { PostgreSQLQueries } from "./postgres-queries";
import { PostgreSQLTransaction } from "./postgres-transaction";



export class PostgreSQlConnection extends PostgreSQLQueries {
    constructor(options?: { host?: string, user?: string, password?: string, database?: string, port?: number }, writing: 'camel' | 'snake' = 'snake' ){
      super(new Pool(options), writing);
    }

    get connection(){
      return this._connection;
    }

    async transaction(){
      const con = await (this._connection as Pool).connect();
      await con.query('BEGIN');
      return new PostgreSQLTransaction(con, this._writing || undefined);
    }
}

