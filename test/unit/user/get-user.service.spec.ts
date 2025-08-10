import { faker } from '@faker-js/faker/.';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { GetUserService } from '../../../src/modules/user/services/get-user.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { currentUserStub, mockLocationModel, mongoUserStub, UserModel } from '../utils';

describe('GetUserService', () => {
  let getUserService: GetUserService;
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserService,
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

    getUserService = moduleRef.get(GetUserService);

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it('should return the user by id', async () => {
      const userId = faker.database.mongodbObjectId();

      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationsFinder = jest.fn((): any => [mongoUserStub.locationId]);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);

      const data = await getUserService.execute(currentUserStub, userId);
      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockDescendantLocationsFinder).toHaveBeenCalledWith(currentUserStub.locationId);
      expect(data).toEqual(new User(mongoUserStub));
    });

    it('if there is no user for id, should throw an error', async () => {
      const userId = faker.database.mongodbObjectId();

      const mockUser = null;
      const mockLean = jest.fn(() => mockUser);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationsFinder = jest.fn((): any => []);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);

      await expect(() => getUserService.execute(currentUserStub, userId)).rejects.toThrow(
        new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.'),
      );
      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockDescendantLocationsFinder).not.toHaveBeenCalled();
    });

    it('if the logged in user is employee and try to fetch manager, throw an error', async () => {
      const userId = faker.database.mongodbObjectId();
      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationsFinder = jest.fn((): any => [mongoUserStub.locationId]);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);

      const currentUser = { ...currentUserStub, role: UserRole.EMPLOYEE };
      await expect(() => getUserService.execute(currentUser, userId)).rejects.toThrow(
        new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You do not have permission to access this user.'),
      );
      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockDescendantLocationsFinder).not.toHaveBeenCalled();
    });

    it('if the location of the fetched user is not in descendants location of the logged in user, throw an error', async () => {
      const userId = faker.database.mongodbObjectId();
      const mockLean = jest.fn(() => mongoUserStub);
      const mockFindById = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findById').mockImplementationOnce(mockFindById);

      const mockDescendantLocationsFinder = jest.fn((): any => []);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);

      await expect(() => getUserService.execute(currentUserStub, userId)).rejects.toThrow(
        new AppException(ErrorCode.USER_HAS_NO_ACCESS, 'You do not have permission to access this user.'),
      );
      expect(mockFindById).toHaveBeenCalledWith(userId);
      expect(mockDescendantLocationsFinder).toHaveBeenCalledWith(currentUserStub.locationId);
    });
  });
});
