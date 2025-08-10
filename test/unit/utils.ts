import { faker } from '@faker-js/faker/.';
import { Model, Types } from 'mongoose';
import { CurrentUser } from 'src/modules/user/user.types';
import { Location } from '../../src/modules/location/location.schema';
import { User, UserRole } from '../../src/modules/user/user.schema';

export abstract class MockModel<T> {
  protected abstract readonly modelStub: T;

  constructor(createModelData: T) {
    this.constructorSpy(createModelData);
  }

  // eslint-disable-next-line
  constructorSpy(_data: T): void {}

  find() {
    return {
      exec: () => [this.modelStub],
      lean: () => [this.modelStub],
    };
  }
  findOne() {
    return {
      exec: () => this.modelStub,
      lean: () => this.modelStub,
    };
  }

  findById() {
    return {
      exec: () => this.modelStub,
      lean: () => this.modelStub,
    };
  }
  save() {
    return jest.fn().mockResolvedValue(this.modelStub);
  }

  findByIdAndUpdate() {
    return jest.fn();
  }

  countDocuments() {
    return {
      exec: () => this.modelStub,
      lean: () => this.modelStub,
    };
  }
}

export class UserModel extends MockModel<Partial<User & { _id: Types.ObjectId }>> {
  protected modelStub = mongoUserStub;
}

// export class LocationModel extends MockModel<Partial<Location & { _id: Types.ObjectId }>> {
//   protected modelStub = null;
// }

export const mockLocationModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  lean: jest.fn(),
  exec: jest.fn(),
  new: jest.fn(),
  constructor: jest.fn(),
} as unknown as Model<Location>;

export const mongoUserStub = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: UserRole.MANAGER,
  locationId: faker.database.mongodbObjectId(),
  password: faker.internet.password(),
  _id: new Types.ObjectId(faker.database.mongodbObjectId()),
};

export const currentUserStub: CurrentUser = {
  id: faker.database.mongodbObjectId(),
  role: UserRole.MANAGER,
  locationId: faker.database.mongodbObjectId(),
};

export const mockUserId = faker.database.mongodbObjectId();
