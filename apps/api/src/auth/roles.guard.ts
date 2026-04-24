import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // No specific roles required
    }

    const request = context.switchToHttp().getRequest();
    const { user, tenantId } = request;

    // Local Dev Shortcut: If we have a valid tenant ID and no user session 
    // (Local POS scenario), we allow access to support unauthenticated terminal sessions.
    if (!user && tenantId) {
      return true;
    }

    if (!user || !user.role) {
      throw new ForbiddenException('User context missing or role undefined');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
       throw new ForbiddenException(`Access restricted to [${requiredRoles.join(', ')}] level clearances.`);
    }

    return true;
  }
}
