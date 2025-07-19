///* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import {
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

import { Role } from './role.enum';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private database: DatabaseService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const { password, firstname, lastname, role } = registerDto;

    // Check if user exists
    const existingUser = await this.database.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert dateOfBirth string to DateTime if provided
    const dateOfBirth = registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null;

    // Create user
    const user = await this.database.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        role: role || Role.CUSTOMER,
        dateOfBirth,

        // KYC fields

        gender: registerDto.gender,
        nationality: registerDto.nationality,
        countryOfBirth: registerDto.countryOfBirth,
        placeOfBirth: registerDto.placeOfBirth,
        phone: registerDto.phone,
        currentAddress: registerDto.currentAddress,
        idDocumentType: registerDto.idDocumentType,
        idDocumentNumber: registerDto.idDocumentNumber,
        employmentStatus: registerDto.employmentStatus,
        occupation: registerDto.occupation,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,

        role: true,
        isEmailVerified: true,
        createdAt: true,
        // Include KYC fields in response if needed
        dateOfBirth: true,
        gender: true,
        nationality: true,
        phone: true,
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.database.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, code, firstname);

    return {
      message: 'User registered successfully. Verification code sent to your email',
      //user,
      user: {
        id: user.id,
        //password: user.password, // Do not return password in response
        email: user.email,
        firstnamename: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.database.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        role: user.role,
      },
      token,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const email = verifyEmailDto.email.toLowerCase();
    const { code } = verifyEmailDto;
    const trimmedCode = code.trim();

    const user = await this.database.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('User not found');

    const otp = await this.database.otpCode.findFirst({
      where: {
        userId: user.id,
        //code,
        code: trimmedCode,
        type: 'EMAIL_VERIFICATION',
        isUsed: false,
        expiresAt: { gte: new Date() }, // Not expired
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.database.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    await this.database.otpCode.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(resendDto: ResendVerificationDto) {
    const { email } = resendDto;

    const user = await this.database.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.database.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    });

    // TODO: Send code to user's email
    try {
      await this.emailService.resendVerification(email, code, user.firstname || 'User');
      console.log(`Verification code sent to ${email}: ${code}`); // Additional logging
    } catch (error) {
      console.error('Failed to send verification email:', error);
      //throw new InternalServerErrorException('Failed to send verification email');
    }

    return { message: 'Verification code sent' };
  }

  async sendPasswordResetOtp(email: string, code: string, name: string) {
    console.log(`Password reset code for ${name} (${email}): ${code}`);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.database.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.database.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // TODO: Send reset code to user's email
    // Log the OTP code to the terminal
    await this.sendPasswordResetOtp(email, code, user.firstname);

    return { message: 'Password reset code sent to email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetPasswordDto;

    const user = await this.database.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const otp = await this.database.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.database.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.database.otpCode.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    return { message: 'Password reset successful' };
  }
}
