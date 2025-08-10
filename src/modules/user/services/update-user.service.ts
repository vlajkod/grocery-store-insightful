import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../../app.exception';
import { DescendantLocationsFinderService } from '../../location/descendant-locations-finder.service';
import { User } from '../user.schema';
import { CurrentUser, UserType } from '../user.types';

@Injectable()
export class UpdateUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async execute(currentUser: CurrentUser, id: string, user: Partial<UserType>): Promise<User> {
    if (user.locationId) {
      await this.checkUserLocation(currentUser.locationId, user.locationId);
    }

    const userExists = await this.userModel.findById(id).lean();
    if (!userExists) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.');
    }

    if (user.email) {
      const emailExists = await this.userModel.findOne({ email: user.email }).lean();

      if (emailExists) {
        throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, 'This email already exist');
      }
    }

    if (user.password) {
      user.password = await hash(user.password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, user, { new: true }).lean();

    return new User(updated!);
  }

  private async checkUserLocation(currentUserLocationId: string, locationId: string) {
    const descendantLocations = await this.descendantLocationsFinderService.execute(currentUserLocationId);

    if (!descendantLocations.includes(locationId)) {
      throw new AppException(ErrorCode.LOCATION_NOT_FOUND, `This location id: ${locationId} does not exist in your location hierarchy.`);
    }
  }
}
