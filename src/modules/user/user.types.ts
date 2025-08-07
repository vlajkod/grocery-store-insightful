import { UserRole } from './user.schema';

export interface CurrentUser {
  id: string;
  locationId: string;
  role: UserRole;
}
