'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/shared/Headers/Header';
import Footer from '@/components/shared/Footer';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { loginVisitor as loginApi } from '@/api/auth/visitor.auth.api';
import { useAuth } from "@/contexts/VisitorAuthContext";
import { toast } from 'react-hot-toast';
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, visitor } = useAuth();

  // If already authenticated as visitor upon landing on this page, redirect to dashboard
  const wasAlreadyLoggedIn = useRef(!!visitor);
  useEffect(() => {
    if (wasAlreadyLoggedIn.current) {
      router.replace('/visitor-dashboard');
    }
  }, [router]);

  // Handle form submission logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginApi(email, password);

      if (response && response.access_token) {
        const token = response.access_token;
        login(token);
        toast.success('Login successful! Redirecting...', {
          style: { background: '#333', color: '#fff' },
        });
        window.location.href = '/visitor-dashboard';
      } else {
        setError('No token received. Please try again.');
        toast.error('No token received. Please try again.', {
          style: { background: '#333', color: '#fff' },
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials.');
      toast.error('Login Failed', {
        style: { background: '#333', color: '#fff' },
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <Header />

      {/* Main Content with theme orange background styling */}
      <main className="flex-1 flex justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-orange/10 via-lightYellow to-orange/5 dark:from-[#1F1715] dark:via-darkBg dark:to-[#161211]">
        {/* Ambient Brand Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-orange/15 dark:bg-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-orange/10 dark:bg-orange/5 rounded-full blur-3xl pointer-events-none" />

        {/* Login Form Card */}
        <div className="relative z-10 w-full max-w-[460px] bg-white dark:bg-darkSurface border border-orange/25 dark:border-zinc-700/80 rounded-3xl shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6 sm:p-8 font-body transition-colors">
          <h1 className="text-3xl sm:text-4xl font-bold text-center font-title text-gray-900 dark:text-zinc-100">
            Start where you left off
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center mt-2">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="grid grid-cols-1 w-full items-center gap-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors disabled:opacity-60"
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                  className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-darkElevated border-2 border-gray-200 dark:border-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-orange dark:focus:border-orange transition-colors disabled:opacity-60"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mt-3">{error}</p>
            )}

            <div className="mt-6 flex flex-col w-full">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 rounded-xl font-title text-base font-bold transition-all flex items-center justify-center ${
                  isLoading
                    ? "bg-zinc-400 dark:bg-zinc-700 text-zinc-200 dark:text-zinc-400 cursor-not-allowed shadow-none"
                    : "bg-orange hover:bg-orange/90 active:scale-[0.99] text-white shadow-md hover:shadow-orange/20 cursor-pointer"
                }`}
              >
                {isLoading ? "Processing..." : "Log In"}
              </button>
            </div>

            <div className="text-center mt-3">
              <Link
                href="/forgot-password?role=visitor"
                className="text-sm text-gray-600 dark:text-zinc-400 hover:text-orange dark:hover:text-orange hover:underline transition-colors"
              >
                Forget your password?
              </Link>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-gray-400 dark:text-zinc-500 text-xs uppercase font-medium">or</span>
              <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
            </div>

            <GoogleAuthButton role="visitor" text="signin_with" />

            <hr className="border-t border-gray-200 dark:border-zinc-800 my-4" />

            <div className="text-center mt-3">
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-none">
                Don&apos;t have an account?{" "}
                <Link href="/visitor-signup" className="text-orange font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>

            <div className="text-center mt-2.5">
              <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 leading-none">
                Are you a wedding service provider?{" "}
                <Link href="/vendor-login" className="text-orange font-bold hover:underline">
                  Start from here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LoginPage;
