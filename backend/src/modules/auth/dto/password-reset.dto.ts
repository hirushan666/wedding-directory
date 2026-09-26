import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeString } from '../../../common/decorators/sanitize-string.decorator';

export type ResetRole = 'visitor' | 'vendor';

export class RequestOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsIn(['visitor', 'vendor'])
  role?: ResetRole;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @SanitizeString({ minLength: 6, maxLength: 6 })
  otp: string;

  @IsOptional()
  @IsIn(['visitor', 'vendor'])
  role?: ResetRole;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  newPassword: string;

  @IsOptional()
  @IsIn(['visitor', 'vendor'])
  role?: ResetRole;
}
