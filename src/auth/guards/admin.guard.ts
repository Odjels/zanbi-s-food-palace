import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
