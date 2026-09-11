import request from '../../utils/request';

export interface GoogleAuthResponse {
  message: string;
  access_token: string;
  visitorId?: string;
  visitorEmail?: string;
  vendorId?: string;
  vendorEmail?: string;
  role: 'visitor' | 'vendor';
  isNewUser: boolean;
}

export const googleAuthApi = async (
  idToken: string,
  role: 'visitor' | 'vendor' = 'visitor',
): Promise<GoogleAuthResponse> => {
  const response = await request.post<GoogleAuthResponse>(
    '/auth/google',
    { idToken, role },
    { withCredentials: true },
  );
  return response.data;
};
