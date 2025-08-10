import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../../app.exception';
import { DescendantLocationCheckerService } from '../../location/descendant-location-checker.service';
import { User, UserRole } from '../user.schema';
import { CurrentUser } from '../user.types';

@Injectable()
export class GetUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationCheckerService: DescendantLocationCheckerService,
  ) {}

  async execute(currentUser: CurrentUser, id: string): Promise<User> {
    const userExists = await this.userModel.findById(id).lean();
    if (!userExists) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.');
    }

    if (currentUser.role === UserRole.EMPLOYEE && userExists.role === UserRole.MANAGER) {
      throw new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You do not have permission to access this user.');
    }

    const inLocationsHierarchy = await this.descendantLocationCheckerService.execute(
      currentUser.locationId,
      userExists.locationId.toString(),
    );
    if (!inLocationsHierarchy) {
      throw new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You do not have permission to access this user.');
    }

    return new User(userExists);
  }
}
