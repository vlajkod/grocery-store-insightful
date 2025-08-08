import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LocationModule } from '../location/location.module';
import { CreateUserService } from './services/create-user.service';
import { DeleteUserService } from './services/delete-user.service';
import { GetAllUsersService } from './services/get-all-users.service';
import { GetUserService } from './services/get-user.service';
import { LocationUsersFinderService } from './services/location-users-finder.service';
import { UpdateUserService } from './services/update-user.service';

import { UserLocationController } from './controllers/user-location.controller';
import { UserManagementController } from './controllers/user-management.controller';
import { User, UserSchema } from './user.schema';

const UserMongooseModule = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);

@Module({
  imports: [UserMongooseModule, LocationModule],
  controllers: [UserManagementController, UserLocationController],
  providers: [
    CreateUserService,
    GetUserService,
    DeleteUserService,
    UpdateUserService,
    GetAllUsersService,
    LocationUsersFinderService,
  ],
  exports: [UserMongooseModule],
})
export class UserModule {}
