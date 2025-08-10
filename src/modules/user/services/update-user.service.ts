import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../../app.exception';
import { DescendantLocationCheckerService } from '../../location/descendant-location-checker.service';
import { User } from '../user.schema';
import { CurrentUser, UserType } from '../user.types';

@Injectable()
export class UpdateUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsCheckerService: DescendantLocationCheckerService,
  ) {}

  async execute(currentUser: CurrentUser, id: string, user: Partial<UserType>): Promise<User> {
    if (user.locationId) {
      const inLocationsHierarchy = await this.descendantLocationsCheckerService.execute(currentUser.locationId, user.locationId);
      if (!inLocationsHierarchy) {
        throw new AppException(
          ErrorCode.LOCATION_NOT_FOUND,
          `This location id: ${user.locationId} does not exist in your location hierarchy.`,
        );
      }
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
}
