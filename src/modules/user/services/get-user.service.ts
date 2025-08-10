import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../../app.exception';
import { DescendantLocationsFinderService } from '../../location/descendant-locations-finder.service';
import { User, UserRole } from '../user.schema';
import { CurrentUser } from '../user.types';

@Injectable()
export class GetUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async execute(currentUser: CurrentUser, id: string): Promise<User> {
    const userExists = await this.userModel.findById(id).lean();
    if (!userExists) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.');
    }

    if (currentUser.role === UserRole.EMPLOYEE && userExists.role === UserRole.MANAGER) {
      throw new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You do not have permission to access this user.');
    }

    await this.checkUserLocation(currentUser.locationId, userExists.locationId.toString());

    return new User(userExists);
  }

  private async checkUserLocation(currentUserLocationId: string, locationId: string) {
    const descendantLocations = await this.descendantLocationsFinderService.execute(currentUserLocationId);

    if (!descendantLocations.includes(locationId)) {
      throw new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You do not have permission to access this user.');
    }
  }
}
