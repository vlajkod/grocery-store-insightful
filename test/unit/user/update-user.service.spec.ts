import { faker } from '@faker-js/faker/.';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { UpdateUserService } from '../../../src/modules/user/services/update-user.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { CurrentUser } from '../../../src/modules/user/user.types';
import { currentUserStub, mockLocationModel, mongoUserStub, UserModel } from './utils';

describe('UpdateUserService', () => {
  let updateUserService: UpdateUserService;
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        DescendantLocationsFinderService,
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

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('should update the user', async () => {
      const userId = faker.database.mongodbObjectId();
      const user = new User(mongoUserStub);

      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationCheck = jest.fn((): any => [mongoUserStub.locationId]);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationCheck);

      const mockEmailLean = jest.fn(() => null);
      const mockFindOne = jest.fn((): any => ({ lean: mockEmailLean }));
      jest.spyOn(userModel, 'findOne').mockImplementationOnce(mockFindOne);
      const mockFindByIdAndUpdate = jest.fn((): any => ({
        lean: jest.fn(() => mongoUserStub),
      }));
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(mockFindByIdAndUpdate);

      const data = await updateUserService.execute(currentUserStub, userId, user);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(userId, user, {
        new: true,
      });
      expect(data).toEqual(new User(mongoUserStub));
    });

    it('if there is email in req, throw an error if email already exists', async () => {
      const currentUser: CurrentUser = {
        id: faker.database.mongodbObjectId(),
        role: UserRole.MANAGER,
        locationId: faker.database.mongodbObjectId(),
      };

      const userId = faker.database.mongodbObjectId();
      const user = new User(mongoUserStub);

      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationsFinder = jest.fn((): any => [mongoUserStub.locationId]);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);

      const mockEmailLean = jest.fn(() => user.email);
      const mockFindOne = jest.fn((): any => ({ lean: mockEmailLean }));
      jest.spyOn(userModel, 'findOne').mockImplementationOnce(mockFindOne);

      const mockFindByIdAndUpdate = jest.fn((): any => ({
        lean: jest.fn(() => mongoUserStub),
      }));
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(mockFindByIdAndUpdate);

      await expect(updateUserService.execute(currentUser, userId, user)).rejects.toThrow(
        new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, 'This email already exist'),
      );
      expect(mockFindOne).toHaveBeenCalledWith({ email: user.email });
    });

    it('if there is location in request object, throw an error if location is not in descendants location of the current user', async () => {
      const userId = faker.database.mongodbObjectId();
      const user = new User(mongoUserStub);

      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationsFinder = jest.fn((): any => []);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);

      const mockEmailLean = jest.fn(() => null);
      const mockFindOne = jest.fn((): any => ({ lean: mockEmailLean }));
      jest.spyOn(userModel, 'findOne').mockImplementationOnce(mockFindOne);

      const mockFindByIdAndUpdate = jest.fn((): any => ({
        lean: jest.fn(() => mongoUserStub),
      }));
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(mockFindByIdAndUpdate);

      await expect(updateUserService.execute(currentUserStub, userId, user)).rejects.toThrow(
        new AppException(ErrorCode.LOCATION_NOT_FOUND, `This location id: ${user.locationId} does not exist in your location hierarchy.`),
      );

      expect(mockFindOne).not.toHaveBeenCalledWith({ email: user.email });
      expect(mockDescendantLocationsFinder).toHaveBeenCalledWith(currentUserStub.locationId);
    });
  });
});
