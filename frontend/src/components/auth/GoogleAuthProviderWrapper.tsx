'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1054418062583-nja3fs3u9q072hh7avht54habq534luu.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
