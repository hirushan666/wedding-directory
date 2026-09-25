'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { googleAuthApi } from '@/api/auth/google.auth.api';
import { useAuth as useVisitorAuth } from '@/contexts/VisitorAuthContext';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface GoogleAuthButtonProps {
  role?: 'visitor' | 'vendor';
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  redirectTo?: string;
}

export default function GoogleAuthButton({
  role = 'visitor',
  text = 'continue_with',
  redirectTo,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const visitorAuth = useVisitorAuth();
  const vendorAuth = useVendorAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<string>("380");

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const clientW = containerRef.current.clientWidth;
        if (clientW > 0) {
          // Google GSI accepts width between 200 and 400 pixels
          const validWidth = Math.min(400, Math.max(240, clientW));
          setButtonWidth(String(Math.floor(validWidth)));
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('No credential received from Google.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Signing in with Google...', {
      style: { background: '#333', color: '#fff' },
    });

    try {
      const response = await googleAuthApi(credentialResponse.credential, role);

      if (response && response.access_token) {
        if (role === 'vendor') {
          vendorAuth.login(response.access_token);
        } else {
          visitorAuth.login(response.access_token);
        }

        toast.success(
          response.isNewUser
            ? 'Account created and signed in with Google!'
            : 'Welcome back!',
          { id: toastId, style: { background: '#333', color: '#fff' } },
        );

        const shouldOnboard =
          response.isNewUser || response.isOnboarded === false;

        const defaultTarget =
          role === 'vendor'
            ? (shouldOnboard ? '/vendor-onboarding' : '/vendor-dashboard')
            : (shouldOnboard ? '/visitor-onboarding' : '/visitor-dashboard');

        const target = redirectTo || defaultTarget;
        window.location.replace(target);
      } else {
        toast.error('Failed to retrieve authentication token.', { id: toastId });
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Google authentication failed. Please try again.';
      toast.error(errorMsg, {
        id: toastId,
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    toast.error('Google Sign-In was cancelled or failed.', {
      style: { background: '#333', color: '#fff' },
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      {/* 
        colorScheme: 'light' is critical on the wrapper:
        In dark mode, browsers force a white background canvas under cross-origin iframes
        unless color-scheme is explicitly set to 'light' on the container.
      */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center items-center min-h-[44px] transition-all ${
          loading ? 'opacity-50 pointer-events-none' : ''
        }`}
        style={{ colorScheme: 'light' }}
      >
        <GoogleLogin
          key={`${isDark ? 'dark' : 'light'}-${buttonWidth}`}
          onSuccess={handleSuccess}
          onError={handleError}
          text={text}
          theme={isDark ? "filled_black" : "outline"}
          size="large"
          shape="rectangular"
          width={buttonWidth}
          containerProps={{
            style: {
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              minHeight: '44px',
              height: 'auto',
            },
          }}
        />
      </div>
    </div>
  );
}
