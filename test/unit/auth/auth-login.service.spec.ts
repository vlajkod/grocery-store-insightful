import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { compare } from 'bcryptjs';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { AuthLoginService } from '../../../src/modules/auth/auth-login.service';
import { User } from '../../../src/modules/user/user.schema';
import { mongoUserStub, UserModel } from '../utils';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthLoginService', () => {
  let authLoginService: AuthLoginService;
  let jwtService: JwtService;
  let userModel: UserModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthLoginService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useClass: UserModel,
        },
      ],
    }).compile();

    authLoginService = moduleRef.get(AuthLoginService);
    jwtService = moduleRef.get(JwtService);
    userModel = moduleRef.get<UserModel>(getModelToken(User.name));
  });

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it('should throw if password does not match', async () => {
      const mockLean = jest.fn(() => new User(mongoUserStub));
      const mockFindEmail = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'find').mockImplementationOnce(mockFindEmail);
      jest.spyOn(jwtService, 'signAsync').mockReturnValue(Promise.resolve('access-token'));

      await expect(() => authLoginService.execute(mongoUserStub.email, mongoUserStub.password)).rejects.toThrow(
        new AppException(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials'),
      );
    });

    it('should return accessToken if credentials are valid', async () => {
      const mockLean = jest.fn(() => new User(mongoUserStub));
      const accessToken = 'test-access-token';
      const mockFindEmail = jest.fn((): any => ({ lean: mockLean }));
      jest.spyOn(userModel, 'find').mockImplementationOnce(mockFindEmail);
      jest.spyOn(jwtService, 'signAsync').mockReturnValue(Promise.resolve(accessToken));
      (compare as jest.Mock).mockResolvedValue(true);
      const result = await authLoginService.execute(mongoUserStub.email, mongoUserStub.password);
      expect(result.accessToken).toBe(accessToken);
    });
  });
});
