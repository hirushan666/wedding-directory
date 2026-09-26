import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeString } from '../../../common/decorators/sanitize-string.decorator';

export class RequestSignupOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @IsIn(['visitor', 'vendor'])
  role: 'visitor' | 'vendor';
}

export class VerifySignupOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @SanitizeString({ minLength: 6, maxLength: 6 })
  otp: string;

  @IsIn(['visitor', 'vendor'])
  role: 'visitor' | 'vendor';
}

export class CompleteVisitorSignupDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;

  @IsString()
  @IsNotEmpty()
  signupVerificationToken: string;
}

export class CompleteVendorSignupDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;

  @SanitizeString({ maxLength: 60, optional: true })
  fname?: string;

  @SanitizeString({ maxLength: 60, optional: true })
  lname?: string;

  @SanitizeString({ maxLength: 120, optional: true })
  busname?: string;

  @SanitizeString({ maxLength: 20, optional: true })
  phone?: string;

  @SanitizeString({ maxLength: 100, optional: true })
  city?: string;

  @SanitizeString({ maxLength: 200, optional: true })
  location?: string;

  @IsString()
  @IsNotEmpty()
  signupVerificationToken: string;
}

export class VisitorOnboardingWelcomeDto {
  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @SanitizeString({ maxLength: 100, optional: true })
  formattedName?: string;
}

export class VendorOnboardingWelcomeDto {
  @IsString()
  @IsNotEmpty()
  vendorId: string;
}
