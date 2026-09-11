export type ResetRole = 'visitor' | 'vendor';

export class RequestOtpDto {
  email: string;
  role?: ResetRole;
}

export class VerifyOtpDto {
  email: string;
  otp: string;
  role?: ResetRole;
}

export class ResetPasswordDto {
  resetToken: string;
  newPassword: string;
  role?: ResetRole;
}
