///* eslint-disable @typescript-eslint/no-unsafe-argument */
///* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../../auth/role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstname: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CUSTOMER;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isEmailVerified?: boolean = false;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}

export class ActivateDeactivateUserDto {
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive: boolean;
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isEmailVerified?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;
}
