import { OmitBy, PartialBy } from '@contable/core/types';

export interface IUserDbRow {
  id: string;
  created_at: Date;
  updated_at: Date;
  role: 'admin' | 'customer';
  is_accountant: boolean;
  status: 'active' | 'lock';
  username: string;
  email: string;
  name: string;
  last_name: string;
  sex: 'M' | 'F';
  cellphone: string;
  pin: string | null;
  password: string;
  jwt_secret_key: string;
  permissions: string[];
}

export interface IUser  {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'admin' | 'customer';
  isAccountant: boolean;
  status: 'active' | 'lock';
  username: string;
  email: string;
  name: string;
  lastName: string;
  sex: 'M' | 'F';
  cellphone: string;
  pin: string | null;
  password: string;
  jwtSecretKey: string;
  permissions: string[];
}

export type UserCreatedValues = PartialBy<OmitBy<IUser, 'id' | 'createdAt' | 'updatedAt' | 'jwtSecretKey'>, 'role' | 'isAccountant' | 'status' | 'pin' | 'permissions'>;
export type UserUpdatedValues = Partial<OmitBy<IUser, 'id' | 'createdAt'>>;