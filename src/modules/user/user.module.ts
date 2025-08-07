import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationModule } from '../location/location.module';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

const UserMongooseModule = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);

@Module({
  imports: [UserMongooseModule, LocationModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserMongooseModule],
})
export class UserModule {}
