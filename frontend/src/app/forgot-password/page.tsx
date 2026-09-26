'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Header from '@/components/shared/Headers/Header';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import OtpInput from '@/components/auth/OtpInput';
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  UserRole,
} from '@/api/auth/password-reset.api';
import { Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { isValidEmail, sanitizeEmail } from '@/lib/validation';

const ForgotPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRoleParam = searchParams.get('role');
  const [role, setRole] = useState<UserRole>(
    initialRoleParam === 'vendor' ? 'vendor' : 'visitor',
  );

  // Wizard step: 1 = Request OTP, 2 = Verify OTP, 3 = Reset Password, 4 = Done
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend cooldown timer
  const [resendTimer, setResendTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordResetOtp(sanitizedEmail, role);
      toast.success(response.message || 'Verification code sent to your email!', {
        style: { background: '#333', color: '#fff' },
      });
      setResendTimer(60);
      setOtp('');
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

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordResetOtp(sanitizedEmail, role);
      toast.success(response.message || 'A new code has been sent.', {
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

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyPasswordResetOtp(email.trim(), cleanOtp, role);
      setResetToken(response.resetToken);
      toast.success('Code verified successfully!', {
        style: { background: '#333', color: '#fff' },
      });
      setStep(3);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Invalid or expired verification code.';
      setError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(resetToken, newPassword, role);
      toast.success(response.message || 'Password updated successfully!', {
        style: { background: '#333', color: '#fff' },
      });
      setStep(4);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginRoute = role === 'vendor' ? '/login' : '/visitor-login';

  return (
    <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-darkSurface border border-orange/25 dark:border-zinc-700/80 rounded-3xl shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 sm:p-8 font-body transition-colors">
      {/* STEP 1: REQUEST OTP */}
      {step === 1 && (
        <>
          <h1 className="text-3xl sm:text-4xl font-bold text-center font-title text-gray-900 dark:text-zinc-100">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mt-2">
            Select your account type and enter your email address to receive a 6-digit OTP code.
          </p>

          {/* Account Type Selector Tabs */}
          <div className="flex border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden mt-6 p-1 bg-gray-50 dark:bg-darkElevated">
            <button
              type="button"
              onClick={() => {
                setRole('visitor');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold text-center rounded-lg transition-all ${
                role === 'visitor'
                  ? 'bg-orange text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              Couple / Visitor
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('vendor');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold text-center rounded-lg transition-all ${
                role === 'vendor'
                  ? 'bg-orange text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              Wedding Vendor
            </button>
          </div>

          <form onSubmit={handleRequestOtp} className="mt-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
              >
                Registered Email Address
              </label>
              <input
                className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                type="email"
                id="email"
                maxLength={254}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmail((prev) => prev.trim().toLowerCase())}
                required
              />
            </div>

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
                {isLoading ? "Processing..." : "Send Verification Code"}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link
                href={loginRoute}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-orange dark:hover:text-orange hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Log In
              </Link>
            </div>
          </form>
        </>
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === 2 && (
        <>
          <div className="w-12 h-12 bg-orange/10 dark:bg-orange/20 text-orange rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-orange" />
          </div>

          <h1 className="text-3xl font-bold text-center font-title text-gray-900 dark:text-zinc-100">
            Verify Code
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mt-2">
            We sent a 6-digit OTP code to <br />
            <span className="font-semibold text-gray-900 dark:text-zinc-200">{email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="mt-6">
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
                {isLoading ? "Processing..." : "Verify Code"}
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
                className="inline-flex items-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 underline transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change email
              </button>

              {resendTimer > 0 ? (
                <span className="text-gray-400 dark:text-zinc-500">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-orange font-semibold hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 3 && (
        <>
          <div className="w-12 h-12 bg-orange/10 dark:bg-orange/20 text-orange rounded-full flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6 text-orange" />
          </div>

          <h1 className="text-3xl font-bold text-center font-title text-gray-900 dark:text-zinc-100">
            New Password
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mt-2">
            Create a strong new password for your account.
          </p>

          <form onSubmit={handleResetPassword} className="mt-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                >
                  New Password
                </label>
                <div className="relative w-full">
                  <input
                    className="w-full h-12 pl-4 pr-12 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative w-full">
                  <input
                    className="w-full h-12 pl-4 pr-12 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

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
                {isLoading ? "Processing..." : "Reset Password"}
              </button>
            </div>
          </form>
        </>
      )}

      {/* STEP 4: SUCCESS STATE */}
      {step === 4 && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
            Password Reset!
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => router.push(loginRoute)}
              className="w-full h-12 rounded-xl text-white font-title text-base sm:text-lg font-bold bg-orange hover:bg-orange/90 active:scale-[0.99] shadow-md hover:shadow-orange/20 transition-all cursor-pointer flex items-center justify-center"
            >
              Go to {role === 'vendor' ? 'Vendor' : 'User'} Log In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <Header />

      {/* Main Content with theme orange background styling */}
      <main className="flex-1 flex justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-orange/10 via-lightYellow to-orange/5 dark:from-[#1F1715] dark:via-darkBg dark:to-[#161211]">
        {/* Ambient Brand Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-orange/15 dark:bg-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-orange/10 dark:bg-orange/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Form with Suspense boundary for useSearchParams */}
        <Suspense
          fallback={
            <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-darkSurface border border-orange/25 dark:border-zinc-700/80 rounded-3xl p-8 shadow-xl space-y-6 animate-fade-in">
              <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="space-y-4 pt-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
