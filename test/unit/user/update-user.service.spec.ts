import { faker } from '@faker-js/faker/.';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { DescendantLocationCheckerService } from '../../../src/modules/location/descendant-location-checker.service';
import { Location } from '../../../src/modules/location/location.schema';
import { UpdateUserService } from '../../../src/modules/user/services/update-user.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { CurrentUser } from '../../../src/modules/user/user.types';
import { mockLocationModel, UserModel } from './utils';

describe('UpdateUserService', () => {
  let updateUserService: UpdateUserService;
  let descendantLocationCheckerService: DescendantLocationCheckerService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        DescendantLocationCheckerService,
        {
          provide: getModelToken(User.name),
          useClass: UserModel,
        },
        {
          provide: getModelToken(Location.name),
          useValue: mockLocationModel,
        },
      ],
    }).compile();

    updateUserService = moduleRef.get(UpdateUserService);

    descendantLocationCheckerService = moduleRef.get(DescendantLocationCheckerService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('should update the user', async () => {
      const currentUser: CurrentUser = {
        id: faker.database.mongodbObjectId(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
      };

      const userId = faker.database.mongodbObjectId();

      const mockUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
        _id: new Types.ObjectId(faker.database.mongodbObjectId()),
      };

      const user = new User(mockUser);

      const mockLean = jest.fn(() => mockUser);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationCheck = jest.fn((): any => true);
      jest.spyOn(descendantLocationCheckerService, 'execute').mockImplementationOnce(mockDescendantLocationCheck);

      const mockEmailLean = jest.fn(() => null);
      const mockFindOne = jest.fn((): any => ({ lean: mockEmailLean }));
      jest.spyOn(userModel, 'findOne').mockImplementationOnce(mockFindOne);
      const mockFindByIdAndUpdate = jest.fn((): any => ({
        lean: jest.fn(() => mockUser),
      }));
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(mockFindByIdAndUpdate);

      const data = await updateUserService.execute(currentUser, userId, user);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(userId, user, {
        new: true,
      });
      expect(data).toEqual(new User(mockUser));
    });

    it('if there is email in req, throw an error if email already exists', async () => {
      const currentUser: CurrentUser = {
        id: faker.database.mongodbObjectId(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
      };

      const userId = faker.database.mongodbObjectId();

      const mockUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
        _id: new Types.ObjectId(faker.database.mongodbObjectId()),
      };

      const user = new User(mockUser);

      const mockLean = jest.fn(() => mockUser);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationCheck = jest.fn((): any => true);
      jest.spyOn(descendantLocationCheckerService, 'execute').mockImplementationOnce(mockDescendantLocationCheck);

      const mockEmailLean = jest.fn(() => user.email);
      const mockFindOne = jest.fn((): any => ({ lean: mockEmailLean }));
      jest.spyOn(userModel, 'findOne').mockImplementationOnce(mockFindOne);

      const mockFindByIdAndUpdate = jest.fn((): any => ({
        lean: jest.fn(() => mockUser),
      }));
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(mockFindByIdAndUpdate);

      await expect(updateUserService.execute(currentUser, userId, user)).rejects.toThrow(
        new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, 'This email already exist'),
      );
      expect(mockFindOne).toHaveBeenCalledWith({ email: user.email });
    });
    it('if there is location in request object, throw an error if location is not in descendants location of the current user', async () => {
      const currentUser: CurrentUser = {
        id: faker.database.mongodbObjectId(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
      };

      const userId = faker.database.mongodbObjectId();

      const mockUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
        _id: new Types.ObjectId(faker.database.mongodbObjectId()),
      };

      const user = new User(mockUser);

      const mockLean = jest.fn(() => mockUser);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationCheck = jest.fn((): any => false);
      jest.spyOn(descendantLocationCheckerService, 'execute').mockImplementationOnce(mockDescendantLocationCheck);

      const mockEmailLean = jest.fn(() => null);
      const mockFindOne = jest.fn((): any => ({ lean: mockEmailLean }));
      jest.spyOn(userModel, 'findOne').mockImplementationOnce(mockFindOne);

      const mockFindByIdAndUpdate = jest.fn((): any => ({
        lean: jest.fn(() => mockUser),
      }));
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(mockFindByIdAndUpdate);

      await expect(updateUserService.execute(currentUser, userId, user)).rejects.toThrow(
        new AppException(ErrorCode.LOCATION_NOT_FOUND, `This location id: ${user.locationId} does not exist in your location hierarchy.`),
      );

      expect(mockFindOne).not.toHaveBeenCalledWith({ email: user.email });
      expect(mockDescendantLocationCheck).toHaveBeenCalledWith(currentUser.locationId, user.locationId);
    });
  });
});
