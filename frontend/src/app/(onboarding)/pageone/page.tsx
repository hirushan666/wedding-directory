'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPageOne() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/visitor-onboarding');
  }, [router]);

  return null;
}
