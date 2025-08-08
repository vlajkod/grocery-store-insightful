import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DescendantLocationsFinderService } from '../../location/descendant-locations-finder.service';
import { PaginateResDto } from '../dtos/paginate.dto';
import { User, UserRole } from '../user.schema';
import { CurrentUser } from '../user.types';

interface Filter {
  locationId: any;
  role?: UserRole;
}
@Injectable()
export class GetAllUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async execute(
    currentUser: CurrentUser,
    page = 1,
    limit = 10,
  ): Promise<PaginateResDto<User>> {
    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUser.locationId,
      );

    const filter: Filter = {
      locationId: {
        $in: descendantLocations.map((id) => new Types.ObjectId(id)),
      },
    };

    if (currentUser.role === UserRole.EMPLOYEE) {
      // If the user is an employee, we should include only employees
      filter.role = UserRole.EMPLOYEE;
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
}
