import { Test, TestingModule } from '@nestjs/testing';
import { UserLocationController } from '../../../src/modules/user/controllers/user-location.controller';
import { LocationUsersFinderService } from '../../../src/modules/user/services/location-users-finder.service';
import { UserRole } from '../../../src/modules/user/user.schema';
import { currentUserStub } from '../utils';

describe('UserLocationController', () => {
  let controller: UserLocationController;
  let locationUsersFinderService: LocationUsersFinderService;

  beforeEach(async () => {
    locationUsersFinderService = { execute: jest.fn() } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLocationController],
      providers: [{ provide: LocationUsersFinderService, useValue: locationUsersFinderService }],
    }).compile();
    controller = module.get<UserLocationController>(UserLocationController);
  });

  it('should get managers by location id', async () => {
    const params = { locationId: 'locId' };
    const query = { page: 1, limit: 10 };
    (locationUsersFinderService.execute as jest.Mock).mockResolvedValue('result');
    const result = await controller.getManagersByLocationId(currentUserStub, params, query);
    // eslint-disable-next-line
    expect(locationUsersFinderService.execute).toHaveBeenCalledWith(
      currentUserStub,
      params.locationId,
      UserRole.MANAGER,
      query.page,
      query.limit,
    );
    expect(result).toBe('result');
  });

  it('should get all managers for location and descendants', async () => {
    const params = { locationId: 'locId' };
    const query = { page: 1, limit: 10 };
    (locationUsersFinderService.execute as jest.Mock).mockResolvedValue('result');
    const result = await controller.getAllManagersForLocationAndTheirDescendants(currentUserStub, params, query);
    // eslint-disable-next-line
    expect(locationUsersFinderService.execute).toHaveBeenCalledWith(
      currentUserStub,
      params.locationId,
      UserRole.MANAGER,
      query.page,
      query.limit,
      true,
    );
    expect(result).toBe('result');
  });

  it('should get employees by location id', async () => {
    const params = { locationId: 'locId' };
    const query = { page: 1, limit: 10 };
    (locationUsersFinderService.execute as jest.Mock).mockResolvedValue('result');
    const result = await controller.getEmployeesByLocationId(currentUserStub, params, query);
    // eslint-disable-next-line
    expect(locationUsersFinderService.execute).toHaveBeenCalledWith(
      currentUserStub,
      params.locationId,
      UserRole.EMPLOYEE,
      query.page,
      query.limit,
    );
    expect(result).toBe('result');
  });

  it('should get all employees for location and descendants', async () => {
    const params = { locationId: 'locId' };
    const query = { page: 1, limit: 10 };
    (locationUsersFinderService.execute as jest.Mock).mockResolvedValue('result');
    const result = await controller.getAllEmployeesForLocationAndTheirDescendants(currentUserStub, params, query);
    // eslint-disable-next-line
    expect(locationUsersFinderService.execute).toHaveBeenCalledWith(
      currentUserStub,
      params.locationId,
      UserRole.EMPLOYEE,
      query.page,
      query.limit,
      true,
    );
    expect(result).toBe('result');
  });
});
