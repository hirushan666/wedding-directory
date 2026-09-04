"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useMutation, useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID } from "@/graphql/queries";
import { UPDATE_VENDOR } from "@/graphql/mutations";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const EditAccount: React.FC = () => {
  const { vendor } = useVendorAuth();
  const { data, loading, refetch } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const vendorData = data?.findVendorById;

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [updateVendor, { loading: isUpdating }] = useMutation(UPDATE_VENDOR, {
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
      console.error("Error updating vendor:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor?.id) return;

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

    updateVendor({
      variables: {
        id: vendor.id,
        input: {
          currentPassword,
          password,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span>Loading account details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="pb-6 mb-6 border-b border-gray-100">
        <h2 className="font-title text-2xl font-bold text-gray-900">Account & Security</h2>
        <p className="text-gray-500 font-body text-sm mt-1">
          Manage your login email and security credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 font-body">
        {/* Email Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Input
              name="email"
              value={vendorData?.email || vendor?.email || ""}
              readOnly
              disabled
              className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-500 pr-10 text-sm cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <FiLock className="text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Your login email cannot be changed directly. Contact support if you need to transfer your account.
          </p>
        </div>

        {/* Password Section */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Change Password</h3>
          <p className="text-xs text-gray-500 mb-5">
            To change your password, please provide your current password for verification.
          </p>

          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative max-w-md">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="h-11 rounded-lg border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm New Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="h-11 rounded-lg border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showRePassword ? "text" : "password"}
                    name="rePassword"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="h-11 rounded-lg border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showRePassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
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

export default EditAccount;

