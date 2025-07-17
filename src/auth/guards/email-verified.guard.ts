import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const dbUser = await this.database.user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser?.isEmailVerified) {
      throw new ForbiddenException('Email verification required');
    }

    return true;
  }
}
