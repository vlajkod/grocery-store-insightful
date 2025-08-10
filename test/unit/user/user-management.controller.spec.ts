import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementController } from '../../../src/modules/user/controllers/user-management.controller';
import { CreateUserService } from '../../../src/modules/user/services/create-user.service';
import { DeleteUserService } from '../../../src/modules/user/services/delete-user.service';
import { GetAllUsersService } from '../../../src/modules/user/services/get-all-users.service';
import { GetUserService } from '../../../src/modules/user/services/get-user.service';
import { UpdateUserService } from '../../../src/modules/user/services/update-user.service';
import { User, UserRole } from '../../../src/modules/user/user.schema';
import { CurrentUser } from '../../../src/modules/user/user.types';
import { currentUserStub, mongoUserStub } from '../utils';

describe('UserManagementController', () => {
  let controller: UserManagementController;
  let createUserService: CreateUserService;
  let getUserService: GetUserService;
  let deleteUserService: DeleteUserService;
  let updateUserService: UpdateUserService;
  let getAllUsersService: GetAllUsersService;

  beforeEach(async () => {
    createUserService = { execute: jest.fn() } as any;
    getUserService = { execute: jest.fn() } as any;
    deleteUserService = { execute: jest.fn() } as any;
    updateUserService = { execute: jest.fn() } as any;
    getAllUsersService = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [
        { provide: CreateUserService, useValue: createUserService },
        { provide: GetUserService, useValue: getUserService },
        { provide: DeleteUserService, useValue: deleteUserService },
        { provide: UpdateUserService, useValue: updateUserService },
        { provide: GetAllUsersService, useValue: getAllUsersService },
      ],
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
  });

  it('should get all users', async () => {
    const currentUser: CurrentUser = { id: 'id', role: UserRole.MANAGER, locationId: 'locId' };
    const query = { page: 1, limit: 10 };
    (getAllUsersService.execute as jest.Mock).mockResolvedValue('result');
    const result = await controller.getAllUser(currentUser, query);
    //eslint-disable-next-line
    expect(getAllUsersService.execute).toHaveBeenCalledWith(currentUser, query.page, query.limit);
    expect(result).toBe('result');
  });

  it('should get user by id', async () => {
    const params = { id: 'userId' };
    (getUserService.execute as jest.Mock).mockResolvedValue('user');
    const result = await controller.getUser(currentUserStub, params);
    //eslint-disable-next-line
    expect(getUserService.execute).toHaveBeenCalledWith(currentUserStub, params.id);
    expect(result).toBe('user');
  });

  it('should create user', async () => {
    const userDto = new User(mongoUserStub);
    (createUserService.execute as jest.Mock).mockResolvedValue('created');
    const result = await controller.createUser(currentUserStub, userDto);
    //eslint-disable-next-line
    expect(createUserService.execute).toHaveBeenCalledWith(currentUserStub, userDto);
    expect(result).toBe('created');
  });

  it('should update user', async () => {
    const params = { id: 'userId' };
    const user = new User(mongoUserStub);
    (updateUserService.execute as jest.Mock).mockResolvedValue('updated');
    const result = await controller.updateUser(currentUserStub, params, user);
    //eslint-disable-next-line
    expect(updateUserService.execute).toHaveBeenCalledWith(currentUserStub, params.id, user);
    expect(result).toBe('updated');
  });

  it('should delete user', async () => {
    const params = { id: 'userId' };
    (deleteUserService.execute as jest.Mock).mockResolvedValue('deleted');
    const result = await controller.deleteUser(currentUserStub, params);
    // eslint-disable-next-line
    expect(deleteUserService.execute).toHaveBeenCalledWith(currentUserStub, params.id);
    expect(result).toBe('deleted');
  });
});
