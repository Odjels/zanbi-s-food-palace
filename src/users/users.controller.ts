// /* eslint-disable @typescript-eslint/no-unsafe-return */

// /* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/role.enum';
import {
  UpdateProfileDto,
  UpdateUserRoleDto,
  ActivateDeactivateUserDto,
  UserQueryDto,
} from './dto/user.dto';
import { User } from 'generated/prisma';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers(@Query() query: UserQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  // Profile Management (User's own profile)
  @Get('profile/me')
  async getMyProfile(@CurrentUser() user: User) {
    return this.userService.getUserById(user.id);
  }

  @Patch('profile/me')
  async updateMyProfile(@Body() updateProfileDto: UpdateProfileDto, @CurrentUser() user: User) {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }

  // Role Management (Admin only)
  @Patch(':userId/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserRole(@Param('userId') userId: string, @Body() updateRoleDto: UpdateUserRoleDto) {
    return this.userService.updateUserRole(userId, updateRoleDto.role);
  }

  @Patch(':userId/activate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async toggleUserActivation(
    @Param('userId') userId: string,
    @Body() activateDto: ActivateDeactivateUserDto,
  ) {
    return this.userService.toggleUserActivation(userId, activateDto.isActive);
  }

  // Public endpoint to get user profile by ID (limited info)
  @Get('profile/:userId')
  async getPublicProfile(@Param('userId') userId: string) {
    const user = await this.userService.getUserById(userId);
    // Return only public information
    return {
      userId: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      bio: user.bio,
      website: user.website,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
