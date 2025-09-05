import { PoolClient } from "pg";
import { PostgreSQLQueries } from "./postgres-queries";

export class PostgreSQLTransaction extends PostgreSQLQueries {
    async commit(){
        try {
            await this._connection.query('COMMIT');
            (this._connection as PoolClient).release();
        } catch (error) {
            this._connection.query('ROLLBACK');
            throw error;
        }
    }
}