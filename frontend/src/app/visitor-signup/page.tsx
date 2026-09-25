'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/VisitorAuthContext";
import { toast } from 'react-hot-toast';
import Header from '@/components/shared/Headers/Header';
import Footer from '@/components/shared/Footer';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import {
  requestSignupOtp,
  verifySignupOtp,
  completeVisitorSignup,
} from '@/api/auth/signup-otp.api';
import { Mail, ArrowLeft } from 'lucide-react';
import OtpInput from "@/components/auth/OtpInput";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Step 1: Enter email & password, Step 2: Enter 6-digit OTP
  const [step, setStep] = useState<1 | 2>(1);

  // Resend cooldown timer
  const [resendTimer, setResendTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendTimer]);

  // Step 1: Request Signup OTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirmPassword) {
      setError('Email, password, and confirmation are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestSignupOtp(trimmedEmail, 'visitor');
      toast.success(response.message || 'Verification code sent to your email!', {
        style: { background: '#333', color: '#fff' },
      });
      setResendTimer(60);
      setStep(2);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to send verification code. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      const response = await requestSignupOtp(email.trim(), 'visitor');
      toast.success(response.message || 'A new verification code has been sent.', {
        style: { background: '#333', color: '#fff' },
      });
      setResendTimer(60);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and complete visitor account creation
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await verifySignupOtp(email.trim(), cleanOtp, 'visitor');
      
      // 2. Complete registration
      const signupRes = await completeVisitorSignup(
        email.trim(),
        password,
        verifyRes.signupVerificationToken,
      );

      if (signupRes && signupRes.access_token) {
        toast.success('Account created! Now set up your wedding profile.', {
          style: { background: '#333', color: '#fff' },
        });

        login(signupRes.access_token);
        router.push('/visitor-onboarding');
      } else {
        setError('Registration succeeded, but login failed. Please sign in.');
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Verification failed. Please check the code and try again.';
      setError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-30 w-full">
        <Header />
      </div>

      {/* Main Content with theme orange background styling */}
      <main className="flex-1 flex justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-orange/10 via-lightYellow to-orange/5 dark:from-[#1F1715] dark:via-darkBg dark:to-[#161211]">
        {/* Ambient Brand Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-orange/15 dark:bg-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-orange/10 dark:bg-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-darkSurface border border-orange/25 dark:border-zinc-700/80 rounded-3xl shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 sm:p-8 font-body transition-colors">
          {/* STEP 1: ENTER DETAILS */}
          {step === 1 && (
            <>
              <h1 className="text-3xl font-bold text-center font-title text-gray-900 dark:text-zinc-100">
                Welcome to Say I Do
              </h1>
              <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mt-2">
                Create your couple account to plan your dream wedding.
              </p>

              <form onSubmit={handleInitiateSignup} className="mt-6">
                <div className="grid grid-cols-1 w-full items-center gap-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                      type="email"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                    >
                      Password
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                      type="password"
                      id="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                      type="password"
                      id="confirmPassword"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
                )}

                <div className="mt-5 flex space-x-2 items-center justify-center">
                  <Checkbox id="terms" defaultChecked />
                  <label htmlFor="terms" className="text-sm leading-none text-gray-600 dark:text-zinc-400 cursor-pointer">
                    Send me wedding tips, ideas and special offers
                  </label>
                </div>

                <div className="mt-6 flex flex-col w-full">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-12 rounded-xl font-title text-base sm:text-lg font-bold transition-all flex items-center justify-center ${
                      isLoading
                        ? "bg-zinc-400 dark:bg-zinc-700 text-zinc-200 dark:text-zinc-400 cursor-not-allowed shadow-none"
                        : "bg-orange hover:bg-orange/90 active:scale-[0.99] text-white shadow-md hover:shadow-orange/20 cursor-pointer"
                    }`}
                  >
                    {isLoading ? "Processing..." : "Continue with Email"}
                  </button>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-gray-400 dark:text-zinc-500 text-xs uppercase font-medium">or</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
                </div>

                <GoogleAuthButton role="visitor" text="signup_with" />

                <div className="text-center mt-4">
                  <p className="text-sm leading-none text-gray-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    <Link href="/visitor-login" className="text-orange hover:underline font-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>

                <hr className="border-t border-gray-200 dark:border-zinc-800 my-4" />

                <div className="text-center mt-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 leading-none">
                    Are you a wedding service provider?{" "}
                    <Link href="/vendor-signup" className="text-orange font-bold hover:underline">
                      Start from here
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* STEP 2: VERIFY OTP CODE */}
          {step === 2 && (
            <>
              <div className="w-12 h-12 bg-orange/10 dark:bg-orange/20 text-orange rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-orange" />
              </div>

              <h1 className="text-3xl font-bold text-center font-title text-gray-900 dark:text-zinc-100">
                Verify Your Email
              </h1>
              <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mt-2">
                We sent a 6-digit verification code to <br />
                <span className="font-semibold text-gray-900 dark:text-zinc-200">{email}</span>
              </p>

              <form onSubmit={handleVerifyAndRegister} className="mt-6">
                <OtpInput
                  length={6}
                  value={otp}
                  onChange={(val) => setOtp(val)}
                  disabled={isLoading}
                />

                {error && (
                  <p className="text-red-500 text-sm text-center mt-3">{error}</p>
                )}

                <div className="mt-6 flex flex-col w-full">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-12 rounded-xl font-title text-base sm:text-lg font-bold transition-all flex items-center justify-center ${
                      isLoading
                        ? "bg-zinc-400 dark:bg-zinc-700 text-zinc-200 dark:text-zinc-400 cursor-not-allowed shadow-none"
                        : "bg-orange hover:bg-orange/90 active:scale-[0.99] text-white shadow-md hover:shadow-orange/20 cursor-pointer"
                    }`}
                  >
                    {isLoading ? "Processing..." : "Verify & Create Account"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Edit email
                  </button>

                  {resendTimer > 0 ? (
                    <span className="text-gray-400 dark:text-zinc-500">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-orange font-semibold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignupPage;
