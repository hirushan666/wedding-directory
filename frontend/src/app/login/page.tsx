'use client'

import React, { useState } from "react";
import Header from "@/components/shared/Headers/Header";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginVendor as loginVendorAPI } from "@/api/auth/vendor.auth.api";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { toast } from 'react-hot-toast';

const VendorLoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { login } = useVendorAuth();
    const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  try {
    // Send login request to backend
    const response = await loginVendorAPI(email, password);

    // Check if login was successful
    if (response && response.message === 'Login successful') {
      // Read token from cookie (backend sets it in cookie)
      const storedToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_tokenVendor='));

      if (storedToken) {
        const token = storedToken.split('=')[1];
        
        // Store token and trigger context login
        login(token);

        // Show success message
        toast.success('Login successful!', {
          style: { background: '#333', color: '#fff' },
        });

        // Redirect to dashboard
        router.push('/vendor-dashboard');
      } else {
        // Token not found in cookie
        setError('No token received. Please try again.');
        toast.error('No token received. Please try again.', {
          style: { background: '#333', color: '#fff' },
        });
      }
    } else {
      setError('Login failed. Please try again.');
      toast.error('Login failed. Please try again.', {
        style: { background: '#333', color: '#fff' },
      });
    }
  } catch (err) {
    console.error('Login failed:', err);
    setError('Invalid credentials. Please try again.');
    toast.error('Invalid credentials. Please try again.', {
      style: { background: '#333', color: '#fff' },
    });
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

          <div className="relative z-10 flex min-h-[calc(100vh-92px)] justify-center items-center px-4 py-10 font-body">
                  <div className="flex w-full flex-col justify-center items-center text-center">
                      <div className="bg-white w-full max-w-[450px] rounded-md p-4 sm:p-8 shadow-lg">
                          <h1 className="text-4xl font-bold text-center font-title">
                              Vendor Login
                          </h1>
                          <form onSubmit={handleSubmit}>
                              <div className="mt-8 grid grid-cols-1 w-full items-center gap-x-12 gap-y-5">
                                  <div className="border-black border-solid border-2 border-opacity-70 rounded-md flex flex-row space-y-1.5">
                                      <Input
                                        className="h-12 pl-6"
                                        type="email"
                                        id="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} // Set email state
                                        required
                                      />
                                  </div>
                                  <div className="border-black border-solid border-2 border-opacity-70 rounded-md flex flex-row space-y-1.5">
                                      <Input
                                        className="h-12 pl-6"
                                        type="password"
                                        id="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} // Set password state
                                        required
                                      />
                                  </div>
                              </div>
                              {/* Show error message */}
                              {error && <p className="text-red-500 mt-2">{error}</p>}

                              <div className="mt-6 flex flex-col w-full">
                                  <Button
                                    type="submit" // Submit button for the form
                                    className="rounded-none text-white font-bold hover:bg-orange bg-orange text-lg"
                                  >
                                      Log In
                                  </Button>
                              </div>
                          </form>
                          <div className="text-center mt-2">
                              <label
                                htmlFor="terms"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                  <Link href="/forgot-password">Forget your password?</Link>
                              </label>
                          </div>
                          <hr className="border-t-2 border-gray-300 my-4" />
                          <div className="text-center mt-3">
                              <label
                                htmlFor="terms"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                  Don&apos;t have an account?{" "}
                                  <Link href="/vendor-signup" className="text-orange hover:underline">
                                      Register Here
                                  </Link>
                              </label>
                          </div>
                          <div className="text-center mt-2">
                              <label
                                htmlFor="visitor-login"
                                className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                  Planning a wedding?{" "}
                                  <Link href="/visitor-login" className="text-orange hover:underline">
                                      User Login
                                  </Link>
                              </label>
                          </div>
                      </div>
                  </div>
          </div>
      </div>
    );
};

export default VendorLoginPage;
