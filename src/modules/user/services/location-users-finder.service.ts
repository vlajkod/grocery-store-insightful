import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery, Types } from 'mongoose';

import { AppException, ErrorCode } from '../../../app.exception';
import { DescendantLocationsFinderService } from '../../location/descendant-locations-finder.service';
import { PaginateResDto } from '../dtos/paginate.dto';
import { User, UserRole } from '../user.schema';
import { CurrentUser } from '../user.types';

@Injectable()
export class LocationUsersFinderService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async execute(
    currentUser: CurrentUser,
    locationId: string,
    role: UserRole,
    page = 1,
    limit = 10,
    descendants = false,
  ): Promise<PaginateResDto<User>> {
    await this.checkUserLocation(currentUser, locationId);

    const filter: RootFilterQuery<User> = {
      role,
    };

    if (descendants) {
      const descendantIds = await this.descendantLocationsFinderService.execute(locationId);
      filter.locationId = {
        $in: descendantIds.map((id) => new Types.ObjectId(id)),
      };
    } else {
      filter.locationId = new Types.ObjectId(locationId);
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter).lean(),
    ]);

    return {
      items: users.map((user) => new User(user)),
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  private async checkUserLocation(currentUser: CurrentUser, locationId: string): Promise<void> {
    const descendantLocations = await this.descendantLocationsFinderService.execute(currentUser.locationId);

    if (!descendantLocations.includes(locationId)) {
      throw new AppException(ErrorCode.LOCATION_NOT_FOUND, `This location id: ${locationId} does not exist in your location hierarchy.`);
    }
  }
}
