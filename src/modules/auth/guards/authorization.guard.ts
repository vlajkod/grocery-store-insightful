import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/modules/user/user.schema';
import { CurrentUser } from 'src/modules/user/user.types';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles) {
      return true;
    }
    const { user }: { user: CurrentUser } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
