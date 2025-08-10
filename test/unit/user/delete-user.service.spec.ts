import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { DeleteUserService } from '../../../src/modules/user/services/delete-user.service';
import { User } from '../../../src/modules/user/user.schema';
import { currentUserStub, mockLocationModel, mongoUserStub, UserModel } from '../utils';

describe('DeleteUserService', () => {
  let deleteUserService: DeleteUserService;
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteUserService,
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

    deleteUserService = moduleRef.get(DeleteUserService);

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('User cannot delete their own account', async () => {
      const mockLean = jest.fn(() => null);
      const mockFindById = jest.fn((): any => ({ exec: mockLean, lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocations = jest.fn((): any => []);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocations);

      await expect(() => deleteUserService.execute(currentUserStub, currentUserStub.id)).rejects.toThrow(
        new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You cannot delete your own account.'),
      );
      expect(mockFindById).not.toHaveBeenCalled();
      expect(mockDescendantLocations).not.toHaveBeenCalled();
    });

    it('If there is no user, throw an error', async () => {
      const userId = faker.database.mongodbObjectId();

      const mockLean = jest.fn(() => null);
      const mockFindById = jest.fn((): any => ({ exec: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocations = jest.fn((): any => []);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocations);

      await expect(() => deleteUserService.execute(currentUserStub, userId)).rejects.toThrow(
        new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.'),
      );
      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockDescendantLocations).not.toHaveBeenCalled();
    });

    it('If there is no user in location hierarchy of the current user, throw an error', async () => {
      const id = faker.database.mongodbObjectId();
      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ exec: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocations = jest.fn((): any => []);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocations);

      await expect(() => deleteUserService.execute(currentUserStub, id)).rejects.toThrow(
        new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You cannot delete this user. This user is not in your location hierarchy.'),
      );
      expect(mockFindById).toHaveBeenCalledWith(id);
      expect(mockDescendantLocations).toHaveBeenCalledWith(currentUserStub.locationId);
    });

    it('User has been deleted from the db', async () => {
      const userId = faker.database.mongodbObjectId();
      const mockLean = jest.fn();
      const mockDeleteOne = jest.fn(() => ({ lean: mockLean }));
      const mockUser = { ...mongoUserStub, deleteOne: mockDeleteOne };
      const mockExec = jest.fn(() => mockUser);
      const mockFindById = jest.fn((): any => ({ exec: mockExec }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocations = jest.fn((): any => [mockUser.locationId]);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocations);

      const result = await deleteUserService.execute(currentUserStub, userId);
      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockDescendantLocations).toHaveBeenCalledWith(currentUserStub.locationId);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(mockLean).toHaveBeenCalled();
      expect(result.deleted).toBeTruthy();
    });
  });
});
