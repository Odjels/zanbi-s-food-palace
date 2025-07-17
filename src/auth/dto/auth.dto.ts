/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsIn,
  IsDateString,
  isEmail,
} from 'class-validator';
import { Role } from '../../auth/role.enum';

export class RegisterDto {
  //@isEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CUSTOMER;

  // KYC fields
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Male', 'Female', 'Other', 'Prefer not to say'])
  gender?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  countryOfBirth?: string;

  @IsOptional()
  @IsString()
  placeOfBirth?: string; // City/State

  @IsOptional()
  @IsString()
  phone?: string; // Should include country code

  @IsOptional()
  @IsString()
  currentAddress?: string; // Full residential address

  @IsOptional()
  @IsString()
  @IsIn(['Passport', 'National ID', "Driver's License"])
  idDocumentType?: string;

  @IsOptional()
  @IsString()
  idDocumentNumber?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'])
  employmentStatus?: string;

  @IsOptional()
  @IsString()
  occupation?: string; // Job title
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}
