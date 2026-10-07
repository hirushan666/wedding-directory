"use client";

import React, { useEffect, useState, Suspense } from "react";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import VendorBanner from "@/components/vendor-dashboard/VendorBanner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { GET_VENDOR_BY_ID } from "@/graphql/queries";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useQuery } from "@apollo/client";
import { MdAdd } from "react-icons/md";
import Footer from "@/components/shared/Footer";
import { VendorDashboardSkeleton } from "@/components/ui/shimmer";
import { FiCalendar, FiShield, FiLayers } from "react-icons/fi";
import BookingCalendar from "@/components/vendor-dashboard/BookingCalendar";
import VendorApprovalRequests from "@/components/vendor-dashboard/VendorApprovalRequests";

const VendorDashBoardContent: React.FC = () => {
  const router = useRouter();
  const { vendor, isInitialized } = useVendorAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [dashboardTab, setDashboardTab] = useState<"calendar" | "approvals">(
    tabParam === "approvals" ? "approvals" : "calendar",
  );

  useEffect(() => {
    if (tabParam === "approvals") {
      setDashboardTab("approvals");
    } else if (tabParam === "calendar") {
      setDashboardTab("calendar");
    }
  }, [tabParam]);

  const {
    data: vendorData,
    loading: vendorLoading,
    error: vendorError,
  } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const v = vendorData?.findVendorById;
  const isIncomplete = Boolean(
    v &&
      (!v.city?.trim() ||
        !v.phone?.trim() ||
        !v.busname?.trim() ||
        v.busname === "My Business")
  );

  // If vendor profile is incomplete (missing city, phone, or business name), redirect to onboarding
  useEffect(() => {
    if (isIncomplete) {
      router.replace("/vendor-onboarding");
    }
  }, [isIncomplete, router]);

  if (!isInitialized || !vendor?.id || vendorLoading || isIncomplete)
    return <VendorDashboardSkeleton />;

  if (vendorError)
    return (
      <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex flex-col font-body">
        <VendorHeader />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="bg-white dark:bg-darkSurface rounded-2xl p-8 border border-red-100 dark:border-red-900/40 text-center max-w-md shadow-sm">
            <p className="text-red-500 font-medium mb-2">
              Error loading vendor dashboard
            </p>
            <p className="text-gray-500 dark:text-zinc-400 text-xs">
              {vendorError?.message}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );

  const vendorInfo = vendorData?.findVendorById;

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex flex-col font-body">
      <VendorHeader />

      <main className="flex-grow max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 w-full">
        {/* Top Header Banner */}
        <div className="mb-3 sm:mb-8">
          {/* Title row */}
          <div className="flex items-center justify-between sm:justify-start gap-4 mb-2 sm:mb-0">
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
              Vendor Dashboard
            </h1>
            {/* Desktop-only: Add New Service button */}
            <Link
              href="/vendor-dashboard/new-service"
              className="hidden sm:inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
            >
              <MdAdd size={20} />
              <span>Add New Service</span>
            </Link>
          </div>
          <p className="hidden sm:block text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
            Monitor customer bookings, manage your storefront profile, and track schedule availability.
          </p>

          {/* Mobile-only: two action buttons row */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/vendor-dashboard/services"
              className="flex-1 inline-flex items-center justify-center gap-1.5 border-2 border-orange/40 text-orange hover:bg-orange/5 font-semibold px-3 py-2 rounded-xl transition-all text-sm"
            >
              <FiLayers size={15} />
              <span>My Services</span>
            </Link>
            <Link
              href="/vendor-dashboard/new-service"
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-orange hover:bg-orange/90 text-white font-semibold px-3 py-2 rounded-xl transition-all shadow-sm text-sm"
            >
              <MdAdd size={17} />
              <span>Add Service</span>
            </Link>
          </div>
        </div>

        {/* Asymmetric Profile + Booking Calendar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 items-start">
          <div className="lg:col-span-4">
            <VendorBanner vendor={vendorInfo} />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-3 lg:gap-4">
            {/* Tab Switcher — full-width on mobile */}
            <div className="flex items-center gap-2 bg-white dark:bg-darkSurface p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 w-full sm:w-fit self-start">
              <button
                onClick={() => {
                  setDashboardTab("calendar");
                  window.history.replaceState(
                    null,
                    "",
                    "/vendor-dashboard?tab=calendar",
                  );
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
                  dashboardTab === "calendar"
                    ? "bg-orange text-white shadow-sm"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-darkElevated"
                }`}
              >
                <FiCalendar size={14} />
                <span>Booking Calendar</span>
              </button>
              <button
                onClick={() => {
                  setDashboardTab("approvals");
                  window.history.replaceState(
                    null,
                    "",
                    "/vendor-dashboard?tab=approvals",
                  );
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
                  dashboardTab === "approvals"
                    ? "bg-orange text-white shadow-sm"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-darkElevated"
                }`}
              >
                <FiShield size={14} />
                <span>Approval Requests</span>
              </button>
            </div>

            {dashboardTab === "calendar" ? (
              <BookingCalendar />
            ) : (
              <VendorApprovalRequests />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const VendorDashboard: React.FC = () => {
  return (
    <Suspense fallback={<VendorDashboardSkeleton />}>
      <VendorDashBoardContent />
    </Suspense>
  );
};

export default VendorDashboard;
