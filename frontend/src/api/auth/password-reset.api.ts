import request from '../../utils/request';

export type UserRole = 'visitor' | 'vendor';

export interface RequestOtpResponse {
  message: string;
  role?: UserRole;
}

export interface VerifyOtpResponse {
  message: string;
  resetToken: string;
  role: UserRole;
}

export interface ResetPasswordResponse {
  message: string;
  role: UserRole;
}

export const requestPasswordResetOtp = async (
  email: string,
  role?: UserRole,
): Promise<RequestOtpResponse> => {
  const response = await request.post<RequestOtpResponse>(
    '/auth/forgot-password/request-otp',
    { email, role },
  );
  return response.data;
};

export const verifyPasswordResetOtp = async (
  email: string,
  otp: string,
  role?: UserRole,
): Promise<VerifyOtpResponse> => {
  const response = await request.post<VerifyOtpResponse>(
    '/auth/forgot-password/verify-otp',
    { email, otp, role },
  );
  return response.data;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
  role?: UserRole,
): Promise<ResetPasswordResponse> => {
  const response = await request.post<ResetPasswordResponse>(
    '/auth/forgot-password/reset-password',
    { resetToken, newPassword, role },
  );
  return response.data;
};
