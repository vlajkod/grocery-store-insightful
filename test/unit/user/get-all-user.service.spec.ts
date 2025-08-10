import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { GetAllUsersService } from '../../../src/modules/user/services/get-all-users.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { CurrentUser } from '../../../src/modules/user/user.types';
import { mockLocationModel, UserModel } from './utils';

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
          useValue: UserModel,
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
    it('should return the user by id', async () => {
      const currentUser: CurrentUser = {
        id: 'id',
        role: UserRole.MANAGER,
        locationId: 'locId',
      };

      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.MANAGER,
        locationId: 'locationId',
        _id: new Types.ObjectId('689659244bdee3e5aa116e83'),
      };

      jest.spyOn(userModel, 'findById').mockImplementationOnce((): any => ({
        lean: () => mockUser,
      }));

      jest.spyOn(descendantLocationsFinderService, 'execute').mockResolvedValueOnce(['locId', 'locationId']);

      const data = await getAllUsersService.execute(currentUser);
      expect(data).toEqual(new User(mockUser));
    });

    // it('if there is no user for id, should throw an error', async () => {
    //   const currentUser: CurrentUser = {
    //     id: 'id',
    //     role: UserRole.MANAGER,
    //     locationId: 'locId',
    //   };

    //   jest.spyOn(userModel, 'findById').mockImplementationOnce((): any => ({
    //     lean: () => null,
    //   }));

    //   jest
    //     .spyOn(descendantLocationsFinderService, 'execute')
    //     .mockResolvedValueOnce(['locId', 'locId2']);

    //   await expect(() =>
    //     getUserService.execute(currentUser, 'id'),
    //   ).rejects.toThrow(
    //     new AppException(ErrorCode.USER_NOT_FOUND, 'User does not exist.'),
    //   );
    // });

    // it('if the logged in user is employee and try to fetch manager, throw an error', async () => {
    //   const currentUser: CurrentUser = {
    //     id: 'id',
    //     role: UserRole.EMPLOYEE,
    //     locationId: 'locId',
    //   };

    //   const mockUser = {
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     role: UserRole.MANAGER,
    //     locationId: 'locId',
    //     _id: new Types.ObjectId('689659244bdee3e5aa116e83'),
    //   };

    //   jest.spyOn(userModel, 'findById').mockImplementationOnce((): any => ({
    //     lean: () => mockUser,
    //   }));

    //   jest
    //     .spyOn(descendantLocationsFinderService, 'execute')
    //     .mockResolvedValueOnce(['locId', 'locId2']);

    //   await expect(() =>
    //     getUserService.execute(currentUser, 'id'),
    //   ).rejects.toThrow(
    //     new AppException(
    //       ErrorCode.USER_HAS_NO_ACCESS,
    //       'You do not have permission to access this user.',
    //     ),
    //   );
    // });

    // it('if the location of the fetched user is not in descendants location of the logged in user, throw an error', async () => {
    //   const currentUser: CurrentUser = {
    //     id: 'id',
    //     role: UserRole.EMPLOYEE,
    //     locationId: 'location1',
    //   };

    //   const mockUser = {
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     role: UserRole.MANAGER,
    //     locationId: 'location2',
    //     _id: new Types.ObjectId('689659244bdee3e5aa116e83'),
    //   };

    //   jest.spyOn(userModel, 'findById').mockImplementationOnce((): any => ({
    //     lean: () => mockUser,
    //   }));

    //   jest
    //     .spyOn(descendantLocationsFinderService, 'execute')
    //     .mockResolvedValueOnce(['location1', 'location3']);

    //   await expect(() =>
    //     getUserService.execute(currentUser, 'id'),
    //   ).rejects.toThrow(
    //     new AppException(
    //       ErrorCode.USER_HAS_NO_ACCESS,
    //       'You do not have permission to access this user.',
    //     ),
    //   );
    // });
  });
});
