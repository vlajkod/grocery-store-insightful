import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../../src/app.exception';
import { AuthenticationGuard } from '../../../src/modules/auth/guards/authentication.guard';
import { User } from '../../../src/modules/user/user.schema';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let jwtService: JwtService;
  let configService: ConfigService;
  let reflector: Reflector;
  let userModel: Model<User>;
  let context: ExecutionContext;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    configService = { get: jest.fn(() => 'secret') } as any;
    reflector = { getAllAndOverride: jest.fn() } as any;
    userModel = { findById: jest.fn() } as any;
    guard = new AuthenticationGuard(jwtService, configService, reflector, userModel);
    context = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  it('should allow public route', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw if no token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (context.switchToHttp().getRequest as jest.Mock).mockReturnValue({ headers: {} });
    await expect(guard.canActivate(context)).rejects.toThrow(
      new AppException(ErrorCode.USER_NOT_FOUND, 'Token not found. User not authenticated.'),
    );
  });

  it('should throw if token is invalid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (context.switchToHttp().getRequest as jest.Mock).mockReturnValue({ headers: { authorization: 'Bearer invalidtoken' } });
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));
    await expect(guard.canActivate(context)).rejects.toThrow(new AppException(ErrorCode.USER_NOT_FOUND, 'Invalid token.'));
  });

  it('should attach user to request and return true', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const mockPayload = { sub: 'userId' };
    const mockUser = { role: 'manager', locationId: 'locId' };
    (context.switchToHttp().getRequest as jest.Mock).mockReturnValue({ headers: { authorization: 'Bearer validtoken' } });
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
    (userModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockUser) });
    const req: any = context.switchToHttp().getRequest();
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.user).toEqual({ id: mockPayload.sub, ...mockUser });
  });
});
