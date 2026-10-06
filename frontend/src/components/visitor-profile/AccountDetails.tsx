"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/VisitorAuthContext";
import { useMutation, useQuery } from "@apollo/client";
import { GET_VISITOR_BY_ID } from "@/graphql/queries";
import { UPDATE_VISITOR } from "@/graphql/mutations";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";

const AccountDetails: React.FC = () => {
  const { visitor } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_VISITOR_BY_ID, {
    variables: { id: visitor?.id },
    skip: !visitor?.id,
  });

  const visitorData = data?.findVisitorById;

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [updateVisitor, { loading: isUpdating }] = useMutation(UPDATE_VISITOR, {
    onCompleted: () => {
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setPassword("");
      setRePassword("");
      refetch();
    },
    onError: (error) => {
      const message =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Error updating password";
      toast.error(message);
      console.error("Error updating visitor password:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitor?.id) return;

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    if (currentPassword === password) {
      toast.error("New password must be different from current password!");
      return;
    }

    if (password !== rePassword) {
      toast.error("Passwords do not match!");
      return;
    }

    updateVisitor({
      variables: {
        id: visitor.id,
        input: {
          currentPassword,
          password,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 dark:border-zinc-800 p-6 sm:p-8 space-y-6 animate-fade-in">
        <div className="pb-6 border-b border-orange/15 dark:border-zinc-800 space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/50 p-8 text-center">
        <p className="text-rose-600 dark:text-rose-400 font-semibold font-body text-sm mb-1">
          Error loading account details
        </p>
        <p className="text-gray-400 dark:text-zinc-500 text-xs font-body">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 dark:border-zinc-800 p-6 sm:p-8">
      <div className="pb-6 mb-6 border-b border-orange/15 dark:border-zinc-800">
        <h2 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
          Account & Security
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
          Manage your login email and security credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 font-body">
        {/* Email Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Input
              name="email"
              value={visitorData?.email || visitor?.email || ""}
              readOnly
              disabled
              className="h-11 rounded-lg border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-darkElevated/50 text-gray-500 dark:text-zinc-400 pr-10 text-sm cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
              <FiLock className="text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">
            Your login email cannot be changed directly. Contact support if you need to transfer your account.
          </p>
        </div>

        {/* Password Section */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">
            Change Password
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-5">
            To change your password, please provide your current password for verification.
          </p>

          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Current Password
              </label>
              <div className="relative max-w-md">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="h-11 rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-900 dark:text-zinc-100 focus:border-orange focus:ring-2 focus:ring-orange/20 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                >
                  {showCurrentPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm New Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="h-11 rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-900 dark:text-zinc-100 focus:border-orange focus:ring-2 focus:ring-orange/20 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showRePassword ? "text" : "password"}
                    name="rePassword"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="h-11 rounded-lg border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-900 dark:text-zinc-100 focus:border-orange focus:ring-2 focus:ring-orange/20 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showRePassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.99] rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetails;