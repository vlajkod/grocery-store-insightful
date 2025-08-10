import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { LocationUsersFinderService } from '../../../src/modules/user/services/location-users-finder.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { currentUserStub, mockLocationModel, mongoUserStub, UserModel } from './utils';

describe('LocationUsersFinderService', () => {
  let locationUsersFinderService: LocationUsersFinderService;
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LocationUsersFinderService,
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

    locationUsersFinderService = moduleRef.get(LocationUsersFinderService);

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it('should return a list of managers for one location', async () => {
      const users = [mongoUserStub, mongoUserStub, mongoUserStub, mongoUserStub];
      const mockLean = jest.fn(() => users);
      const mockLimit = jest.fn((): any => ({ lean: mockLean }));
      const mockSkip = jest.fn((): any => ({ limit: mockLimit }));
      const mockFind = jest.fn((): any => ({ skip: mockSkip }));
      jest.spyOn(userModel, 'find').mockImplementationOnce(mockFind);
      jest.spyOn(userModel, 'countDocuments').mockImplementationOnce((): any => ({
        lean: () => users.length,
      }));
      const locations = [mongoUserStub.locationId, currentUserStub.locationId];
      const mockDescendantLocationsFinder = jest.fn((): any => locations);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);
      const page = 1;
      const limit = 100;
      const data = await locationUsersFinderService.execute(
        currentUserStub,
        mongoUserStub.locationId,
        UserRole.MANAGER,
        page,
        limit,
        false,
      );
      expect(data).toEqual({
        items: users.map((user) => new User(user)),
        total: users.length,
        page,
        limit,
        pageCount: 1,
      });
      const filter = {
        locationId: new Types.ObjectId(mongoUserStub.locationId),
        role: UserRole.MANAGER,
      };
      expect(mockDescendantLocationsFinder).toHaveBeenCalledWith(currentUserStub.locationId);
      expect(mockFind).toHaveBeenCalledWith(filter);
      const skip = (page - 1) * limit;
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
    });

    it('should return a list of managers for one location and their descendants', async () => {
      const users = [mongoUserStub, mongoUserStub, mongoUserStub, mongoUserStub];
      const mockLean = jest.fn(() => users);
      const mockLimit = jest.fn((): any => ({ lean: mockLean }));
      const mockSkip = jest.fn((): any => ({ limit: mockLimit }));
      const mockFind = jest.fn((): any => ({ skip: mockSkip }));
      jest.spyOn(userModel, 'find').mockImplementationOnce(mockFind);
      jest.spyOn(userModel, 'countDocuments').mockImplementationOnce((): any => ({
        lean: () => users.length,
      }));
      const locations = [mongoUserStub.locationId, currentUserStub.locationId];
      jest.spyOn(descendantLocationsFinderService, 'execute').mockResolvedValueOnce(locations);

      const mockDescendantLocationsFinder = jest.fn((): any => locations);
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementationOnce(mockDescendantLocationsFinder);
      const page = 1;
      const limit = 100;
      const data = await locationUsersFinderService.execute(currentUserStub, mongoUserStub.locationId, UserRole.MANAGER, page, limit, true);
      expect(data).toEqual({
        items: users.map((user) => new User(user)),
        total: users.length,
        page,
        limit,
        pageCount: 1,
      });
      const filter = {
        locationId: {
          $in: locations.map((locationId) => new Types.ObjectId(locationId)),
        },
        role: UserRole.MANAGER,
      };
      expect(mockDescendantLocationsFinder).toHaveBeenCalled();
      expect(mockFind).toHaveBeenCalledWith(filter);
      const skip = (page - 1) * limit;
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
    });
  });
});
