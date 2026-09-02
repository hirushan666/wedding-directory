'use client'

import React, { useState } from 'react';
import Header from '@/components/shared/Headers/Header';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { loginVisitor as loginApi } from '@/api/auth/visitor.auth.api';
import { useAuth } from "@/contexts/VisitorAuthContext";
import { toast } from 'react-hot-toast';
import LoaderJelly from "@/components/shared/Loaders/LoaderJelly";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  // Handle form submission logic
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null); // reset any old errors
  setIsLoading(true);

  try {
    // Send login request to backend
    const response = await loginApi(email, password);

    // ✅ Check if backend returned token
    if (response && response.access_token) {
      const token = response.access_token;

      // ✅ Save token in context (or localStorage if you prefer)
      login(token);

      // ✅ Redirect to dashboard
      router.push('/visitor-dashboard');
    } else {
      // ❌ No token found in backend response
      setError('No token received. Please try again.');
      toast.error('No token received. Please try again.', {
        style: { background: '#333', color: '#fff' },
      });
    }
  } catch (err) {
    console.error('Login failed:', err);
    setError('Login failed. Please check your credentials.');
    toast.error('Login Failed', {
      style: { background: '#333', color: '#fff' },
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.webp" // Same image used in Hero component
          alt="Login Background"
          className="object-cover"
          fill
          priority // Ensures the image is loaded faster
        />
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay */}
      </div>

      {/* Login Form */}
      <div className="relative z-20 flex min-h-[calc(100vh-92px)] justify-center items-center px-4 py-10">
        <div className="bg-white w-full max-w-[450px] rounded-md p-4 sm:p-8 font-body shadow-lg relative">
          {/* Loader */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-30">
              <LoaderJelly />
            </div>
          )}

          {!isLoading && (
            <>
              <h1 className="text-4xl font-bold text-center font-title">
                Start where you left off
              </h1>
              <form onSubmit={handleSubmit}>
                <div className="mt-8 grid grid-cols-1 w-full items-center gap-x-12 gap-y-5">
                  <div className="border-black border-solid border-2 border-opacity-70 rounded-md flex flex-row space-y-1.5">
                    <Input
                      className="h-12 pl-6 pb-3"
                      type="email"
                      id="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="border-black border-solid border-2 border-opacity-70 rounded-md flex flex-row space-y-1.5">
                    <Input
                      className="h-12 pl-6 pb-3"
                      type="password"
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                )}
                <div className="mt-6 flex flex-col w-full">
                  <Button type="submit" className="rounded-none text-white font-bold hover:bg-orange bg-orange text-lg">
                    Log In
                  </Button>
                </div>
                <div className="text-center mt-2">
                  <Link
                    href="/forgot-password?role=visitor"
                    className="text-sm text-gray-700 hover:text-orange hover:underline transition-colors"
                  >
                    Forget your password?
                  </Link>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-medium">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <GoogleAuthButton role="visitor" text="signin_with" />

                <hr className="border-t-2 border-gray-300 my-4" />
                <div className="text-center mt-3">
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Don&apos;t have an account?{" "}
                    <Link href="/visitor-signup" className="text-orange hover:underline">
                      Sign Up
                    </Link>
                  </label>
                </div>
                <div className="text-center mt-2">
                  <label
                    htmlFor="terms"
                    className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Are you a wedding service provider?{" "}
                    <Link href="/vendor-login" className="text-orange hover:underline">
                      Start from here
                    </Link>
                  </label>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
