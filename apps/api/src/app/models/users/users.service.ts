import { Injectable } from '@nestjs/common';
import { capitalize } from '@contable/core/utils';
import { isEmail, isUUID } from 'class-validator';
import { hash } from 'argon2';
import { DbConnectionService } from '../../common/db-connection';
import { User } from './user';
import { IUser, UserUpdatedValues } from './user.types';

@Injectable()
export class UsersService {
  constructor(private readonly _dbConnection: DbConnectionService) {}

  public async get(value: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE ${isUUID(value) ? 'id' : `${isEmail(value) ? 'email' : 'username'}`} = $1`;
    const row = (await this._dbConnection.query(sql, [value])).rows[0] ?? null;
    if (!row) return null;
    return User.fromDbRow(row);
  }

  public async getAll(filter?: { ignoreIds?: string[] }): Promise<User[]> {
    const result = await this._dbConnection.query('SELECT * FROM users ORDER BY created_at DESC');
    if (filter?.ignoreIds?.length) {
      return result.rows
        .filter(row => !filter.ignoreIds?.includes(row.id))
        .map(User.fromDbRow);
    }
    return result.rows.map(User.fromDbRow);
  }

  public async create(user: { isAccountant: boolean, username: string, email: string, name: string, last_name: string, sex: string, cellphone: string, password: string }): Promise<User> {
    const result = await this._dbConnection.insert({
      table: 'users',
      data: {
        is_accountant: user.isAccountant,
        username: user.username,
        email: user.email.toLowerCase(),
        name: capitalize(user.name),
        last_name: capitalize(user.last_name),
        sex: user.sex,
        cellphone: user.cellphone,
        password: await hash(user.password)
      },
      returning: '*'
    });

    return User.fromDbRow(result.rows[0]);
  }

  public async update(id: string, update: UserUpdatedValues): Promise<IUser | false> {
    if (update.password) update.password = await hash(update.password);
    if (update.email) update.email = update.email.toLowerCase();
    if (update.name) update.name = capitalize(update.name);
    if (update.lastName) update.lastName = capitalize(update.lastName);
    update.updatedAt = new Date();
    const result = await this._dbConnection.update({
      table: 'users',
      data: update,
      condition: 'id = $1',
      conditionParams: [id],
      returning: '*'
    });

    const row = result.rows[0] ?? null;
    if (!row) return false;
    return User.fromDbRow(row).toObject();
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this._dbConnection.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}
