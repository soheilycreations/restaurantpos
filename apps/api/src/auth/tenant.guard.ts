import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // AuthGuard might populate request.user
    const user = request.user;
    const headerTenantId = request.headers['x-tenant-id'];

    // For Local POS Dev: Allow x-tenant-id header even if no authenticated user session
    if (!user && !headerTenantId) {
      throw new UnauthorizedException('Tenant (Restaurant ID) context missing');
    }

    if (user && !user.restaurantId && !headerTenantId) {
       throw new UnauthorizedException('Tenant (Restaurant ID) context missing');
    }

    request.tenantId = user?.restaurantId || headerTenantId;
    return true;
  }
}
