import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { DescendantLocationsFinderService } from '../../location/descendant-locations-finder.service';

import { AppException, ErrorCode } from '../../../app.exception';
import { User } from '../user.schema';
import { CurrentUser, UserType } from '../user.types';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async execute(currentUser: CurrentUser, user: UserType): Promise<User> {
    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUser.locationId,
      );

    if (!descendantLocations.includes(user.locationId)) {
      throw new AppException(
        ErrorCode.LOCATION_NOT_FOUND,
        `This location id: ${user.locationId} does not exist in your location hierarchy.`,
      );
    }

    const userExists = await this.userModel.findOne({ email: user.email });
    if (userExists) {
      throw new AppException(
        ErrorCode.USER_ALREADY_EXISTS,
        'User already exists',
      );
    }

    const createdUser = new this.userModel({
      ...user,
      locationId: new Types.ObjectId(user.locationId),
    });
    await createdUser.save();
    return new User(createdUser);
  }
}
