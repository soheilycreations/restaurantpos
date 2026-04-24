import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Assuming imported string representation of enum Role for isolation purposes. 
// Values typically: 'ADMIN' | 'CASHIER' | 'KITCHEN'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
