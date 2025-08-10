import { faker } from '@faker-js/faker/.';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { CreateUserService } from '../../../src/modules/user/services/create-user.service';
import { User } from '../../../src/modules/user/user.schema';
import { currentUserStub, mockLocationModel, mongoUserStub, UserModel } from './utils';

describe('CreateUserService', () => {
  let createUserService: CreateUserService;
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateUserService,
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

    createUserService = moduleRef.get(CreateUserService);

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    it('if the location is not in descendant locations of the logged in user, throw an error', async () => {
      const mockUser = {
        name: mongoUserStub.name,
        email: faker.internet.email(),
        role: mongoUserStub.role,
        password: mongoUserStub.password,
        locationId: mongoUserStub.locationId,
      };

      const mockLean = jest.fn(() => mockUser);
      const mockFindOne = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'findOne').mockImplementation(mockFindOne);

      const mockDescendantLocations = jest.fn(() => Promise.resolve([]));
      jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementation(mockDescendantLocations);

      await expect(() => createUserService.execute(currentUserStub, mockUser)).rejects.toThrow(
        new AppException(
          ErrorCode.LOCATION_NOT_FOUND,
          `This location id: ${mockUser.locationId} does not exist in your location hierarchy.`,
        ),
      );
      expect(mockFindOne).not.toHaveBeenCalledWith(mockUser.email);
      expect(mockDescendantLocations).toHaveBeenCalledWith(currentUserStub.locationId);
    });
  });

  it('if the email already exists, throw an error', async () => {
    const mockUser = {
      name: mongoUserStub.name,
      email: faker.internet.email(),
      role: mongoUserStub.role,
      password: mongoUserStub.password,
      locationId: mongoUserStub.locationId,
    };

    const mockLean = jest.fn(() => mockUser);
    const mockFindOne = jest.fn((): any => ({ lean: mockLean }));
    jest.spyOn(userModel, 'findOne').mockImplementation(mockFindOne);

    const mockDescendantLocations = jest.fn(() => Promise.resolve([mockUser.locationId.toString()]));
    jest.spyOn(descendantLocationsFinderService, 'execute').mockImplementation(mockDescendantLocations);

    await expect(() => createUserService.execute(currentUserStub, mockUser)).rejects.toThrow(
      new AppException(ErrorCode.USER_ALREADY_EXISTS, 'User already exists'),
    );
    expect(mockFindOne).not.toHaveBeenCalledWith(mockUser.email);
    expect(mockDescendantLocations).toHaveBeenCalledWith(currentUserStub.locationId);
  });
});
