import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { DescendantLocationsFinderService } from '../location/descendant-locations-finder.service';
import { User, UserRole } from './user.schema';
import { CurrentUser } from './user.types';

interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locationId: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly descendantLocationsFinderService: DescendantLocationsFinderService,
  ) {}

  async getById(currentUser: CurrentUser, id: string): Promise<IUser> {
    const userExists = await this.userModel.findById(id).lean();
    if (!userExists) {
      throw new NotFoundException('User does not exist.');
    }

    if (
      currentUser.role === UserRole.EMPLOYEE &&
      userExists.role === UserRole.MANAGER
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this user.',
      );
    }

    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUser.locationId,
      );

    if (!descendantLocations.includes(userExists.locationId.toString())) {
      throw new ForbiddenException(
        'This user is not in your location hierarchy.',
      );
    }

    return {
      id: userExists._id.toString(),
      name: userExists.name,
      email: userExists.email,
      role: userExists.role,
      locationId: userExists.locationId.toString(),
    };
  }

  async create(currentUser: CurrentUser, user: Partial<User>): Promise<IUser> {
    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUser.locationId,
      );

    if (!descendantLocations.includes(user.locationId!.toString())) {
      throw new ForbiddenException(
        `This does not exist in your location hierarchy.`,
      );
    }

    const userExists = await this.userModel
      .findOne({ email: user.email })
      .lean();

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const createdUser = new this.userModel(user);
    await createdUser.save();
    return createdUser.toDto();
  }

  async update(
    currentUser: CurrentUser,
    id: string,
    user: Partial<User>,
  ): Promise<IUser> {
    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUser.locationId,
      );

    const userExists = await this.userModel.findById(id).lean();

    if (!userExists) {
      throw new NotFoundException('User does not exist.');
    }

    if (
      user.locationId &&
      !descendantLocations.includes(user.locationId.toString())
    ) {
      throw new ForbiddenException(
        `This does not exist in your location hierarchy.`,
      );
    }

    const emailExists =
      user.email && (await this.userModel.findOne({ email: user.email }));
    if (emailExists) {
      throw new ConflictException('This email already exist');
    }

    if (user.password) {
      user.password = await hash(user.password, 10);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .lean();

    return {
      id,
      name: updated!.name,
      locationId: updated!.locationId,
      role: updated!.role,
      email: updated!.email,
    };
  }

  async delete(
    currentUser: CurrentUser,
    id: string,
  ): Promise<{ deleted: boolean }> {
    if (currentUser.id === id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    const descendantLocations =
      await this.descendantLocationsFinderService.execute(
        currentUser.locationId,
      );

    if (!descendantLocations.includes(user.locationId.toString())) {
      throw new ForbiddenException(
        'You cannot delete this user. This user is not in your location hierarchy.',
      );
    }

    await this.userModel.findByIdAndDelete(id);
    return { deleted: true };
  }
}
