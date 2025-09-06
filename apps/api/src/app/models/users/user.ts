import { verify } from 'argon2';
import { IUser, IUserDbRow } from './user.types';

export class User {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly  role: 'admin' | 'customer';
  public readonly isAccountant: boolean;
  public readonly status: 'active' | 'lock';
  public readonly username: string;
  public readonly email: string;
  public readonly name: string;
  public readonly lastName: string;
  public readonly sex: 'M' | 'F';
  public readonly cellphone: string;
  public readonly pin: string | null;
  public readonly password: string;
  public readonly jwtSecretKey: string;
  public readonly permissions: string[];

  constructor(data: IUser) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.role = data.role;
    this.isAccountant = data.isAccountant;
    this.status = data.status;
    this.username = data.username;
    this.email = data.email;
    this.name = data.name;
    this.lastName = data.lastName;
    this.sex = data.sex;
    this.cellphone = data.cellphone;
    this.pin = data.pin;
    this.password = data.password;
    this.jwtSecretKey = data.jwtSecretKey;
    this.permissions = data.permissions;
  }

  public static fromDbRow(row: IUserDbRow): User {
    return new User({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      role: row.role,
      isAccountant: row.is_accountant,
      status: row.status,
      username: row.username,
      email: row.email,
      name: row.name,
      lastName: row.last_name,
      sex: row.sex,
      cellphone: row.cellphone,
      pin: row.pin,
      password: row.password,
      jwtSecretKey: row.jwt_secret_key,
      permissions: row.permissions,
    });
  }

  public async verifyPassword(password: string ): Promise<boolean> {
    return await verify(this.password, password);
  }

  public toObject(): IUser {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      role: this.role,
      isAccountant: this.isAccountant,
      status: this.status,
      username: this.username,
      email: this.email,
      name: this.name,
      lastName: this.lastName,
      sex: this.sex,
      cellphone: this.cellphone,
      pin: this.pin,
      password: this.password,
      jwtSecretKey: this.jwtSecretKey,
      permissions: this.permissions,
    }
  }

  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      role: this.role,
      isAccountant: this.isAccountant,
      status: this.status,
      username: this.username,
      email: this.email,
      name: this.name,
      lastName: this.lastName,
      sex: this.sex,
      cellphone: this.cellphone,
      pin: this.pin,
      password: this.password,
      jwtSecretKey: this.jwtSecretKey,
      permissions: this.permissions,
    }
  }
}