import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { GetAllUsersService } from '../../../src/modules/user/services/get-all-users.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { currentUserStub, mockLocationModel, mongoUserStub, UserModel } from '../utils';

describe('GetAllUsersService', () => {
  let getAllUsersService: GetAllUsersService;
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetAllUsersService,
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

    getAllUsersService = moduleRef.get(GetAllUsersService);

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    it('if the logged in user is manager, should return list of the all users', async () => {
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
      const page = 1;
      const limit = 100;
      const data = await getAllUsersService.execute(currentUserStub, page, limit);
      expect(data).toEqual({
        items: users.map((user) => new User(user)),
        total: users.length,
        page,
        limit,
        pageCount: 1,
      });
      expect(mockFind).toHaveBeenCalledWith({ locationId: { $in: locations.map((locationId) => new Types.ObjectId(locationId)) } });
      const skip = (page - 1) * limit;
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
    });

    it('if the logged in user is employee, should return list of the employees only', async () => {
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
      const page = 1;
      const limit = 100;
      const currentUser = { ...currentUserStub, role: UserRole.EMPLOYEE };
      const data = await getAllUsersService.execute(currentUser, page, limit);
      expect(data).toEqual({
        items: users.map((user) => new User(user)),
        total: users.length,
        page,
        limit,
        pageCount: 1,
      });
      expect(mockFind).toHaveBeenCalledWith({
        locationId: { $in: locations.map((locationId) => new Types.ObjectId(locationId)) },
        role: UserRole.EMPLOYEE,
      });
      const skip = (page - 1) * limit;
      expect(mockSkip).toHaveBeenCalledWith(skip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
    });
  });
});
