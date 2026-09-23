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
import { FiCalendar, FiShield } from "react-icons/fi";
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

  // If vendor profile is incomplete (missing city, phone, or location), redirect to onboarding
  useEffect(() => {
    if (vendorData?.findVendorById) {
      const v = vendorData.findVendorById;
      const isIncomplete = !v.city || !v.phone || !v.location;
      if (isIncomplete) {
        router.push("/vendor-onboarding");
      }
    }
  }, [vendorData, router]);

  if (!isInitialized || !vendor?.id || vendorLoading)
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

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-title text-3xl font-bold text-gray-900 dark:text-zinc-100">
              Vendor Dashboard
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
              Monitor customer bookings, manage your storefront profile, and track schedule availability.
            </p>
          </div>
          <Link
            href="/vendor-dashboard/new-service"
            className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm self-start sm:self-auto"
          >
            <MdAdd size={20} />
            <span>Add New Service</span>
          </Link>
        </div>

        {/* Asymmetric Profile + Booking Calendar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-4">
            <VendorBanner vendor={vendorInfo} />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-darkSurface p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 w-fit self-start">
              <button
                onClick={() => {
                  setDashboardTab("calendar");
                  window.history.replaceState(
                    null,
                    "",
                    "/vendor-dashboard?tab=calendar",
                  );
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
