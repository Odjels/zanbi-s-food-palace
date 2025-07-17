///* eslint-disable @typescript-eslint/no-unsafe-assignment */
///* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';

import { UpdateProfileDto, UserQueryDto } from './dto/user.dto';
import { Role } from '../auth/role.enum';

@Injectable()
export class UsersService {
  constructor(
    private database: DatabaseService,
    private emailService: EmailService,
  ) {}

  async getAllUsers(query: UserQueryDto) {
    const { search, role, isEmailVerified, page, limit } = query;
    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    const skip = (currentPage - 1) * currentLimit;

    //const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isEmailVerified !== undefined) {
      where.isEmailVerified = isEmailVerified;
    }

    const [users, total] = await Promise.all([
      this.database.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          bio: true,
          phone: true,
          avatar: true,
          address: true,
          website: true,
          location: true,
          dateOfBirth: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.database.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,

        isEmailVerified: true,
        bio: true,
        phone: true,
        address: true,
        location: true,
        dateOfBirth: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.database.user.findUnique({
      where: { email },
    });
  }

  async deleteUser(id: string) {
    const user = await this.database.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.database.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  // Profile Management
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.dateOfBirth) {
      updateProfileDto.dateOfBirth = new Date(updateProfileDto.dateOfBirth).toISOString();
    }

    const updatedUser = await this.database.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        bio: true,
        phone: true,
        address: true,
        website: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  //   async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
  //     const { currentPassword, newPassword } = changePasswordDto;

  //     const user = await this.database.user.findUnique({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     // Verify current password
  //     const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  //     if (!isCurrentPasswordValid) {
  //       throw new BadRequestException('Current password is incorrect');
  //     }

  //     // Hash new password
  //     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  //     await this.database.user.update({
  //       where: { id: userId },
  //       data: {
  //         password: hashedNewPassword,
  //       },
  //     });

  //     return {
  //       message: 'Password changed successfully',
  //     };
  //   }

  // Role Management
  // async updateUserRole( updateRoleDto: UpdateUserRoleDto) {
  //   const { userId, role } = updateRoleDto;

  //   const user = await this.database.user.findUnique({
  //     where: { id: userId },
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   const updatedUser = await this.database.user.update({
  //     where: { id: userId },
  //     data: {
  //       role,

  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       firstname: true,
  //       lastname: true,
  //       role: true,
  //      isActive: true,
  //       updatedAt: true,
  //     },
  //   });

  //   return {
  //     message: 'User role updated successfully',
  //     user: updatedUser,
  //   };
  // }

  async updateUserRole(userId: string, role: Role) {
    //const { userId, role } = updateRoleDto;

    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.database.user.update({
      where: { id: userId },
      data: {
        role,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User role updated successfully',
      user: updatedUser,
    };
  }

  async toggleUserActivation(userId: string, isActive: boolean) {
    // Find user first
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user activation status
    const updatedUser = await this.database.user.update({
      where: { id: userId },
      data: {
        isActive,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Send notification email
    try {
      if (isActive) {
        await this.emailService.sendEmailVerification(user.email, '123456', user.firstname); // Account activated email
      }
    } catch (error) {
      console.error('Failed to send activation notification:', error);
    }

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    };
  }
}
