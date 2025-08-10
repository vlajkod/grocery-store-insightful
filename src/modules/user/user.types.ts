import { User } from './user.schema';

export type CurrentUser = Pick<User, 'id' | 'locationId' | 'role'>;

export type UserType = Pick<User, 'name' | 'email' | 'role' | 'locationId' | 'password'>;

export const FETCH_DESCENDANTS = 'all';
