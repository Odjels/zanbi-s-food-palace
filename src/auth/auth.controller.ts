import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendVerificationDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Role } from './role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Protected routes examples
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'Profile data',
      user,
    };
  }

  @Get('verified-only')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  async verifiedOnly(@CurrentUser() user: any) {
    return {
      message: 'This endpoint requires email verification',
      user,
    };
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminOnly(@CurrentUser() user: any) {
    return {
      message: 'Admin only content',
      user,
    };
  }

  @Get('creator-or-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async creatorOrAdmin(@CurrentUser() user: any) {
    return {
      message: 'Creator or Admin content',
      user,
    };
  }
}
