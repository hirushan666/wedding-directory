'use client'

import Header from "@/components/shared/Headers/Header";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import CityInput from "@/components/vendor-signup/CityInput";
import LocationInput from "@/components/vendor-signup/LocationInput";
import { useRouter } from "next/navigation";
import FirstNameInput from "@/components/vendor-signup/FirstNameInput";
import LastNameInput from "@/components/vendor-signup/LastNameInput";
import BusinessNameInput from "@/components/vendor-signup/BusinessNameInput";
import PhoneInput from "@/components/vendor-signup/PhoneInput";
import EmailInput from "@/components/vendor-signup/EmailInput";
import PasswordInput from "@/components/vendor-signup/PasswordInput";
import RePassword from "@/components/vendor-signup/RePassword";
import { toast } from 'react-hot-toast';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import LoaderJelly from "@/components/shared/Loaders/LoaderJelly";
import {
  requestSignupOtp,
  verifySignupOtp,
  completeVendorSignup,
} from '@/api/auth/signup-otp.api';
import { Mail, X, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const router = useRouter();
  const { login } = useVendorAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rpassword: '',
    fname: '',
    lname: '',
    busname: '',
    phone: '',
    city: '',
    location: ''
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
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

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLocationChange = (location: string) => {
    setFormData({ ...formData, location });
  };

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city });
  };

  const goToVendorLogin = () => {
    router.push('/vendor-login');
  };

  // Step 1: Validate form and request OTP
  const onRegister = async () => {
    if (!termsAccepted) {
      toast.error('You must accept the terms and conditions', {
        style: { background: '#333', color: '#fff' },
      });
      return;
    }

    if (!formData.fname || !formData.lname || !formData.busname || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields.', {
        style: { background: '#333', color: '#fff' },
      });
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.', {
        style: { background: '#333', color: '#fff' },
      });
      return;
    }

    if (formData.password !== formData.rpassword) {
      toast.error('Passwords do not match.', {
        style: { background: '#333', color: '#fff' },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestSignupOtp(formData.email.trim(), 'vendor');
      toast.success(response.message || 'Verification code sent to your email!', {
        style: { background: '#333', color: '#fff' },
      });
      setResendTimer(60);
      setOtp('');
      setOtpError(null);
      setShowOtpModal(true);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to send verification code. Please check your email.';
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const response = await requestSignupOtp(formData.email.trim(), 'vendor');
      toast.success(response.message || 'A new verification code has been sent.', {
        style: { background: '#333', color: '#fff' },
      });
      setResendTimer(60);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to resend code. Please try again.';
      setOtpError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP & complete registration
  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await verifySignupOtp(formData.email.trim(), cleanOtp, 'vendor');

      // 2. Complete Vendor Registration
      const signupRes = await completeVendorSignup(
        formData,
        verifyRes.signupVerificationToken,
      );

      if (signupRes && signupRes.access_token) {
        toast.success('Vendor account registered successfully!', {
          style: { background: '#333', color: '#fff' },
        });

        login(signupRes.access_token);
        setShowOtpModal(false);
        router.push('/vendor-dashboard');
      } else {
        setOtpError('Registration succeeded, but login failed. Please sign in.');
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Verification failed. Please check the code.';
      setOtpError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#333', color: '#fff' },
      });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="relative z-20">
        <Header />
      </div>

      <div className="absolute inset-0">
        <Image
          src="/images/login-signup.webp"
          fill
          className="object-cover"
          alt="sign image"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative z-10 min-h-[calc(100vh-92px)] px-4 py-10 font-body">
        <div className='flex flex-col justify-center items-center text-center'>
          <div><p className="w-full text-white">Crafting Timeless Celebrations</p></div>
          <div><h1 className="font-title font-bold text-3xl w-full text-white">Welcome Vendors</h1></div>
          <div className='bg-white mt-6 w-full max-w-[600px] rounded-md p-4 sm:p-8 shadow-lg' >
            <h1 className='text-text mx-[30px] md:mx-[90px] text-2xl font-bold text-center font-title'>
              Connect with couples to make their dream wedding come true!
            </h1>
            <form onSubmit={(e) => { e.preventDefault(); onRegister(); }}>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 w-full items-center gap-x-12 gap-y-5">
                <FirstNameInput value={formData.fname} onChange={handleChange} />
                <LastNameInput value={formData.lname} onChange={handleChange} />
                <BusinessNameInput value={formData.busname} onChange={handleChange} />
                <CityInput placeholder='Select city' onCityChange={handleCityChange} />

                <div className="md:col-span-2">
                  <LocationInput placeholder='Search for location' onLocationChange={handleLocationChange} />
                </div>

                <PhoneInput value={formData.phone} onChange={handleChange} />
                <EmailInput value={formData.email} onChange={handleChange} />
                <PasswordInput value={formData.password} onChange={handleChange} />
                <RePassword value={formData.rpassword} onChange={handleChange} />
              </div>

              <div className="mt-6 flex space-x-2 text-left">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                <label
                  htmlFor="terms"
                  className="text-sm text-left leading-none text-gray-700">
                  By submitting and sharing your information, you agree to the{' '}
                  <Link href="/terms-of-use" target="_blank" className="underline hover:text-orange">
                    terms of use
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" target="_blank" className="underline hover:text-orange">
                    privacy policy
                  </Link>{' '}
                  of Say I Do.
                </label>
              </div>

              <div className="border-black rounded-md border-2 mt-6 flex flex-col w-full border-solid bg-orange">
                <Button
                  type="submit"
                  className="rounded-none text-white font-bold hover:bg-orange bg-orange text-lg h-12"
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? "Sending Verification..." : "Register Now"}
                </Button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <GoogleAuthButton role="vendor" text="signup_with" />
            </form>

            <div className="mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <button onClick={goToVendorLogin} className="text-orange font-semibold hover:underline">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[440px] rounded-lg p-6 sm:p-8 font-body shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {otpLoading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-lg">
                <LoaderJelly />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-orange/10 text-orange rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-orange" />
            </div>

            <h2 className="text-2xl font-bold text-center font-title text-gray-900">
              Verify Business Email
            </h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              We sent a 6-digit verification code to <br />
              <span className="font-semibold text-gray-800">{formData.email}</span>
            </p>

            <form onSubmit={handleVerifyAndComplete} className="mt-6">
              <div className="border-black border-solid border-2 border-opacity-70 rounded-md flex flex-row space-y-1.5">
                <Input
                  className="h-12 text-center text-2xl font-mono tracking-widest uppercase font-bold"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                  }}
                  autoFocus
                  required
                />
              </div>

              {otpError && (
                <p className="text-red-500 text-sm text-center mt-2.5">{otpError}</p>
              )}

              <div className="mt-6 flex flex-col w-full">
                <Button
                  type="submit"
                  className="rounded-none text-white font-bold hover:bg-orange bg-orange text-base sm:text-lg h-12"
                  disabled={otpLoading}
                >
                  Verify & Create Account
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm mt-5">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Edit details
                </button>

                {resendTimer > 0 ? (
                  <span className="text-gray-400">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
