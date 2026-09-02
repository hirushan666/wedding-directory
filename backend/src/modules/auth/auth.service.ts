import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { VisitorService } from '../visitor/visitor.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VisitorEntity } from '../../database/entities/visitor.entity';
import { jwtSecret } from './constants';
import { VendorService } from '../vendor/vendor.service';
import { VendorEntity } from '../../database/entities/vendor.entity';
import { PasswordResetOtpEntity } from '../../database/entities/password_reset_otp.entity';
import { MailService } from '../mail/mail.service';
import { ResetRole } from './dto/password-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly vendorService: VendorService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(PasswordResetOtpEntity)
    private readonly otpRepository: Repository<PasswordResetOtpEntity>,
  ) {}

  async validateVisitor(email: string, password: string): Promise<VisitorEntity | null> {
    const visitor = await this.visitorService.getVisitorByEmail(email);

    if (!visitor) {
      return null;
    }

    const passwordIsValid = await bcrypt.compare(password, visitor.password);
    return passwordIsValid ? visitor : null;
  }

  async validateVendor(email: string, password: string): Promise<VendorEntity | null> {
    const vendor = await this.vendorService.getVendorByEmail(email);

    if (!vendor) {
      return null;
    }
    const passwordIsValid = await bcrypt.compare(password, vendor.password);
    return passwordIsValid ? vendor : null;
  }

  loginVisitor(visitor: VisitorEntity): { access_token: string } {
    const payload = {
      email: visitor.email,
      sub: visitor.id,
      role: 'visitor',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  loginVendor(vendor: VendorEntity): { access_token: string } {
    const payload = {
      email: vendor.email,
      sub: vendor.id,
      role: 'vendor',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyVisitor(token: string): Promise<VisitorEntity> {
    const decoded = this.jwtService.verify(token, {
      secret: jwtSecret,
    });

    const visitor = await this.visitorService.getVisitorByEmail(decoded.email);

    if (!visitor) {
      throw new Error('Unable to get the visitor from decoded token');
    }
    return visitor;
  }

  async verifyVendor(token: string): Promise<VendorEntity> {
    const decoded = this.jwtService.verify(token, {
      secret: jwtSecret,
    });

    const vendor = await this.vendorService.getVendorByEmail(decoded.email);

    if (!vendor) {
      throw new Error('Unable to get the vendor from decoded token');
    }
    return vendor;
  }

  /**
   * Generates and emails a 6-digit OTP code to the requested email.
   * Prevents user enumeration by returning a generic success message.
   */
  async requestPasswordResetOtp(
    rawEmail: string,
    role?: ResetRole,
  ): Promise<{ message: string; role?: ResetRole }> {
    const email = rawEmail?.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email address is required.');
    }

    let detectedRole: ResetRole | null = role || null;

    // Check account existence based on role or detect automatically
    if (detectedRole === 'visitor') {
      const visitor = await this.visitorService.getVisitorByEmail(email);
      if (!visitor) {
        return {
          message: 'If an account exists with this email address, a verification code has been sent.',
        };
      }
    } else if (detectedRole === 'vendor') {
      const vendor = await this.vendorService.getVendorByEmail(email);
      if (!vendor) {
        return {
          message: 'If an account exists with this email address, a verification code has been sent.',
        };
      }
    } else {
      const visitor = await this.visitorService.getVisitorByEmail(email);
      if (visitor) {
        detectedRole = 'visitor';
      } else {
        const vendor = await this.vendorService.getVendorByEmail(email);
        if (vendor) {
          detectedRole = 'vendor';
        } else {
          return {
            message: 'If an account exists with this email address, a verification code has been sent.',
          };
        }
      }
    }

    // Cooldown check (60 seconds)
    const recentOtp = await this.otpRepository.findOne({
      where: { email, userType: detectedRole, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (
      recentOtp &&
      Date.now() - new Date(recentOtp.createdAt).getTime() < 60 * 1000
    ) {
      const secondsLeft = Math.ceil(
        (60 * 1000 - (Date.now() - new Date(recentOtp.createdAt).getTime())) / 1000,
      );
      throw new BadRequestException(
        `Please wait ${secondsLeft} second${secondsLeft === 1 ? '' : 's'} before requesting another code.`,
      );
    }

    // Invalidate existing active OTPs for this email and role
    await this.otpRepository.update(
      { email, userType: detectedRole, isUsed: false },
      { isUsed: true },
    );

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const otpEntity = this.otpRepository.create({
      email,
      userType: detectedRole,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      isUsed: false,
    });
    await this.otpRepository.save(otpEntity);

    // Send email (or log to console in dev fallback mode)
    await this.mailService.sendOtpEmail(email, otp, detectedRole);

    return {
      message: 'If an account exists with this email address, a verification code has been sent.',
      role: detectedRole,
    };
  }

  /**
   * Verifies the 6-digit OTP and returns a signed single-use JWT reset token.
   */
  async verifyPasswordResetOtp(
    rawEmail: string,
    rawOtp: string,
    role?: ResetRole,
  ): Promise<{ message: string; resetToken: string; role: ResetRole }> {
    const email = rawEmail?.trim().toLowerCase();
    const otp = rawOtp?.trim();

    if (!email || !otp) {
      throw new BadRequestException('Email and verification code are required.');
    }

    const whereCondition: any = { email, isUsed: false };
    if (role) {
      whereCondition.userType = role;
    }

    const record = await this.otpRepository.findOne({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new BadRequestException('The verification code is invalid or has expired.');
    }

    if (new Date() > new Date(record.expiresAt)) {
      throw new BadRequestException('The verification code has expired. Please request a new code.');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      record.attempts += 1;
      await this.otpRepository.save(record);
      const remaining = 5 - record.attempts;
      throw new BadRequestException(
        remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Too many incorrect attempts. Please request a new code.',
      );
    }

    // Mark as used
    record.isUsed = true;
    await this.otpRepository.save(record);

    // Retrieve user id
    let userId = '';
    if (record.userType === 'visitor') {
      const visitor = await this.visitorService.getVisitorByEmail(record.email);
      if (!visitor) throw new NotFoundException('Visitor account not found');
      userId = visitor.id;
    } else {
      const vendor = await this.vendorService.getVendorByEmail(record.email);
      if (!vendor) throw new NotFoundException('Vendor account not found');
      userId = vendor.id;
    }

    // Create 15-minute reset JWT
    const resetToken = this.jwtService.sign(
      {
        sub: userId,
        email: record.email,
        role: record.userType,
        purpose: 'reset_password',
      },
      { expiresIn: '15m' },
    );

    return {
      message: 'Code verified successfully.',
      resetToken,
      role: record.userType,
    };
  }

  /**
   * Updates password after validating the resetToken JWT.
   */
  async resetPassword(
    resetToken: string,
    newPassword: string,
    role?: ResetRole,
  ): Promise<{ message: string; role: ResetRole }> {
    if (!resetToken) {
      throw new BadRequestException('Reset token is required.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(resetToken, { secret: jwtSecret });
    } catch {
      throw new BadRequestException(
        'Your password reset session has expired or is invalid. Please request a new code.',
      );
    }

    if (decoded.purpose !== 'reset_password') {
      throw new BadRequestException('Invalid token purpose.');
    }

    const resolvedRole: ResetRole = role || decoded.role;
    if (resolvedRole === 'visitor') {
      await this.visitorService.updatePassword(decoded.sub, newPassword);
    } else {
      await this.vendorService.updatePassword(decoded.sub, newPassword);
    }

    return {
      message: 'Password reset successfully. You can now log in with your new password.',
      role: resolvedRole,
    };
  }
}