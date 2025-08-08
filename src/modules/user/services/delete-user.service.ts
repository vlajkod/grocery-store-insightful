import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../../app.exception';
import { DescendantLocationsFinderService } from '../../location/descendant-locations-finder.service';
import { User } from '../user.schema';
import { CurrentUser } from '../user.types';

@Injectable()
export class DeleteUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async execute(
    currentUser: CurrentUser,
    id: string,
  ): Promise<{ deleted: boolean }> {
    if (currentUser.id === id) {
      throw new AppException(
        ErrorCode.USER_HAS_NO_ACCESS,
        'You cannot delete your own account.',
      );
    }

    const userExists = await this.userModel.findById(id).exec();
    if (!userExists) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.');
    }

    await this.checkUserLocation(
      currentUser.locationId,
      userExists.locationId.toString(),
    );

    await userExists.deleteOne().lean();
    return { deleted: true };
  }

  private async checkUserLocation(
    currentUserLocationId: string,
    locationId: string,
  ) {
    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUserLocationId,
      );

    if (!descendantLocations.includes(locationId)) {
      throw new AppException(
        ErrorCode.USER_HAS_NO_ACCESS,
        'You cannot delete this user. This user is not in your location hierarchy.',
      );
    }
  }
}
