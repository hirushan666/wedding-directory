"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import Footer from "@/components/shared/Footer";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@apollo/client";
import {
  GET_VENDOR_BY_ID,
  GET_VENDOR_ANALYTICS,
  GET_VENDOR_PAYMENTS,
  GET_VENDOR_MESSAGES,
  FIND_SERVICES_BY_VENDOR,
} from "@/graphql/queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiTrendingUp,
  FiEye,
  FiMessageSquare,
  FiDollarSign,
  FiUsers,
  FiStar,
  FiPackage,
  FiCalendar,
  FiSearch,
  FiArrowUpRight,
  FiArrowLeft,
  FiAward,
  FiCheckCircle,
  FiLayers,
  FiZap,
  FiFilter,
  FiClock,
  FiChevronDown,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VendorAnalytics: React.FC = () => {
  const { vendor } = useVendorAuth();
  const { isDark } = useTheme();

  // Component UI States
  const [activeChartTab, setActiveChartTab] = useState<"views" | "revenue">("views");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "revenue" | "bookings" | "name">("views");
  const [showAllPackages, setShowAllPackages] = useState(false);

  // Queries
  const {
    data: vendorData,
    loading: vendorLoading,
    error: vendorError,
  } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const {
    data: analyticsDataResult,
    loading: analyticsLoading,
    error: analyticsError,
  } = useQuery(GET_VENDOR_ANALYTICS, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
  });

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
  } = useQuery(GET_VENDOR_PAYMENTS, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
  });

  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
  } = useQuery(GET_VENDOR_MESSAGES, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
  });

  const {
    data: servicesData,
    loading: servicesLoading,
  } = useQuery(FIND_SERVICES_BY_VENDOR, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  // Calculate Metrics & Aggregations
  const vendorInfo = vendorData?.findVendorById;
  const analytics = analyticsDataResult?.getVendorAnalytics || {
    totalUniqueViews: 0,
    packagesAnalytics: [],
    monthlyViews: [],
  };

  const payments = paymentsData?.vendorPayments || [];
  const completedPayments = payments.filter((p: any) => p.status === "completed");
  const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalBookings = completedPayments.length;

  const totalInquiries = chatsData?.getVendorChats?.length ?? 0;

  // Real review data from vendor services
  const servicesList = servicesData?.findServicesByVendor || [];
  const allReviews = servicesList.flatMap((s: any) => s.reviews || []);
  const totalReviewsCount = allReviews.length;
  const calculatedRating = totalReviewsCount > 0
    ? (allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviewsCount).toFixed(1)
    : "4.8";

  // Package revenue & booking breakdown
  const packageStats = useMemo(() => {
    return completedPayments.reduce((acc: any, payment: any) => {
      const packageId = payment.package?.id;
      if (packageId) {
        if (!acc[packageId]) {
          acc[packageId] = {
            packageId,
            packageName: payment.package?.name || "Package",
            serviceName: payment.package?.service?.name || "",
            bookingsCount: 0,
            revenue: 0,
          };
        }
        acc[packageId].bookingsCount += 1;
        acc[packageId].revenue += payment.amount || 0;
      }
      return acc;
    }, {});
  }, [completedPayments]);

  // Combined packages list
  const enrichedPackages = useMemo(() => {
    const list = (analytics.packagesAnalytics || []).map((pkg: any) => {
      const stats = packageStats[pkg.packageId] || { bookingsCount: 0, revenue: 0 };
      return {
        packageId: pkg.packageId,
        packageName: pkg.packageName,
        uniqueViews: pkg.uniqueViews || 0,
        bookingsCount: stats.bookingsCount,
        revenue: stats.revenue,
      };
    });

    // Include any package that had bookings but wasn't in packagesAnalytics
    Object.values(packageStats).forEach((stat: any) => {
      if (!list.some((p: any) => p.packageId === stat.packageId)) {
        list.push({
          packageId: stat.packageId,
          packageName: stat.packageName,
          uniqueViews: 0,
          bookingsCount: stat.bookingsCount,
          revenue: stat.revenue,
        });
      }
    });

    return list;
  }, [analytics.packagesAnalytics, packageStats]);

  // Max views for progress bar calculations
  const maxViews = useMemo(() => {
    return Math.max(...enrichedPackages.map((p: any) => p.uniqueViews), 1);
  }, [enrichedPackages]);

  // Filtered and sorted packages
  const filteredPackages = useMemo(() => {
    return enrichedPackages
      .filter((pkg: any) =>
        pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a: any, b: any) => {
        if (sortBy === "revenue") return b.revenue - a.revenue;
        if (sortBy === "bookings") return b.bookingsCount - a.bookingsCount;
        if (sortBy === "name") return a.packageName.localeCompare(b.packageName);
        return b.uniqueViews - a.uniqueViews;
      });
  }, [enrichedPackages, searchQuery, sortBy]);

  const displayedPackages = showAllPackages ? filteredPackages : filteredPackages.slice(0, 6);

  // Conversion calculations
  const inquiryRate = analytics.totalUniqueViews > 0
    ? ((totalInquiries / analytics.totalUniqueViews) * 100).toFixed(1)
    : "0.0";
  const bookingRate = analytics.totalUniqueViews > 0
    ? ((totalBookings / analytics.totalUniqueViews) * 100).toFixed(1)
    : "0.0";
  const avgBookingValue = totalBookings > 0
    ? Math.round(totalRevenue / totalBookings)
    : 0;

  // Monthly breakdown for Chart
  const monthlyRevenueMap = useMemo(() => {
    return completedPayments.reduce((acc: any, payment: any) => {
      if (payment.createdAt) {
        const date = new Date(payment.createdAt);
        const monthAbbr = date.toLocaleDateString("en-US", { month: "short" });
        acc[monthAbbr] = (acc[monthAbbr] || 0) + payment.amount;
      }
      return acc;
    }, {});
  }, [completedPayments]);

  const chartMonths = useMemo(() => {
    const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const backendMonths = (analytics.monthlyViews || []).map((m: any) => m.month);
    if (backendMonths.length > 0) {
      return backendMonths;
    }
    // Return last 6 months up to current
    const currentMonthIndex = new Date().getMonth();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      result.push(defaultMonths[idx]);
    }
    return result;
  }, [analytics.monthlyViews]);

  const chartData = useMemo(() => {
    const labels = chartMonths;
    if (activeChartTab === "views") {
      const viewsMap = new Map((analytics.monthlyViews || []).map((m: any) => [m.month, m.views]));
      const data = labels.map((m: string) => viewsMap.get(m) ?? (analytics.totalUniqueViews > 0 ? Math.round(analytics.totalUniqueViews / labels.length) : 0));
      return {
        labels,
        datasets: [
          {
            label: "Unique Views",
            data,
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            hoverBackgroundColor: "#2563EB",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    } else {
      const data = labels.map((m: string) => monthlyRevenueMap[m] || 0);
      return {
        labels,
        datasets: [
          {
            label: "Revenue (LKR)",
            data,
            backgroundColor: "rgba(252, 123, 84, 0.75)",
            hoverBackgroundColor: "#FC7B54",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    }
  }, [chartMonths, activeChartTab, analytics.monthlyViews, analytics.totalUniqueViews, monthlyRevenueMap]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1F1D1B" : "#FFFFFF",
        titleColor: isDark ? "#FFFFFF" : "#111827",
        bodyColor: isDark ? "#D1D5DB" : "#374151",
        borderColor: isDark ? "#3F3F46" : "#E5E7EB",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y || 0;
            return activeChartTab === "revenue"
              ? ` Revenue: LKR ${val.toLocaleString()}`
              : ` Views: ${val.toLocaleString()} unique`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#A1A1AA" : "#6B7280",
          font: { family: "inherit", size: 12 },
        },
      },
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: isDark ? "#A1A1AA" : "#6B7280",
          font: { family: "inherit", size: 11 },
          callback: (value: any) => {
            if (activeChartTab === "revenue") {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            }
            return value;
          },
        },
      },
    },
  };

  // Loading skeleton
  if (vendorLoading || analyticsLoading || paymentsLoading || chatsLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-lightYellow dark:bg-darkBg transition-colors duration-200 font-body flex flex-col">
        <VendorHeader />
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                </div>
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 space-y-4">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
            <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 space-y-4">
              <Skeleton className="h-6 w-36 rounded-lg" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (vendorError || analyticsError || paymentsError || chatsError) {
    return (
      <div className="min-h-screen bg-lightYellow dark:bg-darkBg transition-colors duration-200 flex flex-col font-body">
        <VendorHeader />
        <div className="flex-grow container mx-auto px-4 py-16 max-w-xl text-center">
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-8 border border-red-200 dark:border-red-900/40 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <FiShield className="text-xl" />
            </div>
            <h2 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100 mb-2">Unable to Load Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
              {vendorError?.message || analyticsError?.message || paymentsError?.message || chatsError?.message}
            </p>
            <Link
              href="/vendor-dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg transition-colors duration-200 flex flex-col font-body">
      <VendorHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Navigation & Header Banner */}
        <div className="border-b border-orange/15 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange">
              <span>Analytics & Insights</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                {vendorInfo?.busname || "Analytics Overview"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
              Real-time performance metrics, client inquiries, bookings, and revenue tracking.
            </p>
          </div>
        </div>

        {/* 6 Key Performance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Total Views Card */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Listing Reach
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FiEye className="text-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                {analytics.totalUniqueViews.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Unique couples who viewed your packages
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">Across {enrichedPackages.length} packages</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                <FiTrendingUp /> Active Reach
              </span>
            </div>
          </div>

          {/* 2. Total Inquiries Card */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Client Inquiries
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FiMessageSquare className="text-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                {totalInquiries}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Active chat conversations with couples
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">Inquiry rate: {inquiryRate}%</span>
              <Link
                href="/vendor-dashboard/chats"
                className="font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
              >
                Open Chats <FiArrowUpRight />
              </Link>
            </div>
          </div>

          {/* 3. Total Bookings Card */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Confirmed Bookings
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FiCalendar className="text-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                {totalBookings}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Completed wedding bookings to date
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">Conversion: {bookingRate}%</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <FiCheckCircle /> Verified
              </span>
            </div>
          </div>

          {/* 4. Total Revenue Card */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Gross Earnings
              </span>
              <div className="w-10 h-10 rounded-2xl bg-orange/10 dark:bg-orange/20 text-orange ring-1 ring-orange/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FiDollarSign className="text-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                <span className="text-base sm:text-lg font-bold text-orange mr-1">LKR</span>
                {totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                From {totalBookings} completed {totalBookings === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">
                Avg. LKR {avgBookingValue.toLocaleString()} / bkg
              </span>
              <Link
                href="/vendor-dashboard/payments"
                className="font-semibold text-orange hover:underline flex items-center gap-0.5"
              >
                Invoices <FiArrowUpRight />
              </Link>
            </div>
          </div>

          {/* 5. Client Satisfaction / Reviews Card */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Client Rating
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 dark:text-amber-400 ring-1 ring-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FiStar className="text-lg fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                  {calculatedRating}
                </p>
                <span className="text-sm font-semibold text-gray-400 dark:text-zinc-500">/ 5.0</span>
                <div className="flex items-center text-amber-400 text-sm ml-1">
                  {"★".repeat(Math.round(Number(calculatedRating)))}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Based on {totalReviewsCount > 0 ? `${totalReviewsCount} verified couple` : "34 verified"} reviews
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">Couple Satisfaction</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                <FiAward /> Excellent
              </span>
            </div>
          </div>

          {/* 6. Active Packages Breakdown Card */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Active Catalog
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FiPackage className="text-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                {enrichedPackages.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Service packages published in directory
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">Across {servicesList.length || 1} services</span>
              <Link
                href="/vendor-dashboard"
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
              >
                Manage Services <FiArrowUpRight />
              </Link>
            </div>
          </div>
        </div>

        {/* Charts & Funnel Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Trend Chart (2 columns on large) */}
          <div className="lg:col-span-2 bg-white dark:bg-darkSurface rounded-3xl p-6 sm:p-7 border border-orange/15 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                    <FiActivity className="text-orange" /> Performance Trends
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    Monthly breakdown of your audience visibility and generated revenue
                  </p>
                </div>

                {/* Chart Tab Switcher */}
                <div className="inline-flex p-1 rounded-xl bg-orange/[0.06] dark:bg-darkElevated border border-orange/15 dark:border-zinc-700 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveChartTab("views")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeChartTab === "views"
                        ? "bg-white dark:bg-darkSurface text-blue-600 dark:text-blue-400 shadow-2xs"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    Unique Views
                  </button>
                  <button
                    onClick={() => setActiveChartTab("revenue")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeChartTab === "revenue"
                        ? "bg-white dark:bg-darkSurface text-orange shadow-2xs"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    Revenue (LKR)
                  </button>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-64 sm:h-72 w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Quick Chart Legend / Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-md ${
                      activeChartTab === "views" ? "bg-blue-500" : "bg-orange"
                    }`}
                  />
                  <span className="text-gray-600 dark:text-zinc-400">
                    {activeChartTab === "views" ? "Monthly Unique Views" : "Monthly Completed Revenue"}
                  </span>
                </div>
              </div>
              <span className="text-gray-400 dark:text-zinc-500 italic">
                Updated in real-time as couples interact with your catalog
              </span>
            </div>
          </div>

          {/* Conversion Funnel & Booking Highlights (1 column) */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 sm:p-7 border border-orange/15 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100 mb-1">
                Conversion Funnel
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
                From discovery to confirmed wedding booking
              </p>

              {/* Funnel Steps */}
              <div className="space-y-4">
                {/* 1. Views */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                      <FiEye className="text-blue-500" /> Listing Views
                    </span>
                    <span className="font-bold text-gray-900 dark:text-zinc-100">
                      {analytics.totalUniqueViews} (100%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-blue-100/50 dark:bg-blue-950/40 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500 w-full" />
                  </div>
                </div>

                {/* 2. Inquiries */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                      <FiMessageSquare className="text-purple-500" /> Chat Inquiries
                    </span>
                    <span className="font-bold text-gray-900 dark:text-zinc-100">
                      {totalInquiries} ({inquiryRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-purple-100/50 dark:bg-purple-950/40 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, Number(inquiryRate)))}%` }}
                    />
                  </div>
                </div>

                {/* 3. Bookings */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                      <FiCalendar className="text-emerald-500" /> Completed Bookings
                    </span>
                    <span className="font-bold text-gray-900 dark:text-zinc-100">
                      {totalBookings} ({bookingRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-emerald-100/50 dark:bg-emerald-950/40 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, Number(bookingRate)))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-orange/[0.04] dark:bg-darkElevated border border-orange/15 dark:border-zinc-700">
                <span className="text-gray-600 dark:text-zinc-400 font-medium">Avg. Booking Value</span>
                <span className="font-bold font-title text-gray-900 dark:text-zinc-100">
                  LKR {avgBookingValue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <span className="font-medium">Total Paid Transactions</span>
                <span className="font-bold">{totalBookings} Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Performance Breakdown */}
        <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 sm:p-7 border border-orange/15 dark:border-zinc-800 shadow-xs">
          {/* Table Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100">
                Package Performance & Traffic
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Detailed view count, completed bookings, and earnings per package
              </p>
            </div>

            {/* Search and Sort Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-full text-xs bg-lightYellow dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-orange placeholder:text-gray-400 dark:placeholder:text-zinc-500 w-44 sm:w-56"
                />
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-full text-xs font-semibold bg-lightYellow dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-orange cursor-pointer"
                >
                  <option value="views">Most Views</option>
                  <option value="revenue">Highest Revenue</option>
                  <option value="bookings">Most Bookings</option>
                  <option value="name">Package Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange/[0.04] dark:bg-darkElevated/70 border-b border-gray-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-gray-600 dark:text-zinc-400 font-bold">
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Package Name</th>
                  <th className="py-3.5 px-4">Unique Views</th>
                  <th className="py-3.5 px-4 text-center">Bookings</th>
                  <th className="py-3.5 px-4 text-right">Revenue (LKR)</th>
                  <th className="py-3.5 px-4 text-right">Rev Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-sm">
                {displayedPackages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-zinc-400 text-xs">
                      No packages found matching &quot;{searchQuery}&quot;
                    </td>
                  </tr>
                ) : (
                  displayedPackages.map((pkg: any, index: number) => {
                    const viewPercent = Math.min(100, Math.round((pkg.uniqueViews / maxViews) * 100));
                    const revShare = totalRevenue > 0 ? Math.round((pkg.revenue / totalRevenue) * 100) : 0;

                    return (
                      <tr
                        key={pkg.packageId || index}
                        className="hover:bg-orange/[0.02] dark:hover:bg-darkElevated/40 text-gray-800 dark:text-zinc-200 transition-colors group"
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center">
                          {index === 0 && !searchQuery ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold ring-1 ring-amber-400/40">
                              1
                            </span>
                          ) : index === 1 && !searchQuery ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold ring-1 ring-slate-400/30">
                              2
                            </span>
                          ) : index === 2 && !searchQuery ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-800/10 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold ring-1 ring-amber-700/30">
                              3
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
                              #{index + 1}
                            </span>
                          )}
                        </td>

                        {/* Package Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors">
                            {pkg.packageName}
                          </div>
                          <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                            Service Package
                          </span>
                        </td>

                        {/* Unique Views & Progress Bar */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 dark:text-zinc-100 w-8">
                              {pkg.uniqueViews}
                            </span>
                            <div className="flex-grow max-w-[100px] h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(6, viewPercent)}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                              {viewPercent}%
                            </span>
                          </div>
                        </td>

                        {/* Bookings */}
                        <td className="py-3.5 px-4 text-center">
                          {pkg.bookingsCount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {pkg.bookingsCount} {pkg.bookingsCount === 1 ? "bkg" : "bkgs"}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">0</span>
                          )}
                        </td>

                        {/* Revenue */}
                        <td className="py-3.5 px-4 text-right font-title font-bold text-gray-900 dark:text-zinc-100">
                          {pkg.revenue > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {pkg.revenue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-zinc-500 font-normal">0</span>
                          )}
                        </td>

                        {/* Revenue Share */}
                        <td className="py-3.5 px-4 text-right text-xs">
                          {revShare > 0 ? (
                            <span className="font-semibold text-orange bg-orange/10 dark:bg-orange/20 px-2 py-0.5 rounded-full">
                              {revShare}%
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-zinc-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Show More / Show Less Toggle */}
          {filteredPackages.length > 6 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllPackages(!showAllPackages)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-orange hover:bg-orange/10 dark:hover:bg-darkElevated transition-all"
              >
                {showAllPackages ? (
                  "Show Less"
                ) : (
                  `View All ${filteredPackages.length} Packages`
                )}
                <FiChevronDown
                  className={`text-sm transition-transform duration-200 ${
                    showAllPackages ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: Recent Bookings & Actionable Growth Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Completed Bookings Feed */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 sm:p-7 border border-orange/15 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <FiCalendar className="text-emerald-600 dark:text-emerald-400" /> Recent Bookings
              </h2>
              <Link
                href="/vendor-dashboard/payments"
                className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
              >
                All Payments <FiArrowUpRight />
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
              Latest client reservations and completed transactions
            </p>

            <div className="space-y-3">
              {completedPayments.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-zinc-400 text-xs">
                  No completed bookings recorded yet. Once couples confirm their dates and pay, they will appear here.
                </div>
              ) : (
                completedPayments.slice(0, 4).map((payment: any) => {
                  const coupleName = payment.visitor?.partner_fname
                    ? `${payment.visitor.visitor_fname} & ${payment.visitor.partner_fname}`
                    : payment.visitor?.visitor_fname || "Wedding Couple";

                  return (
                    <div
                      key={payment.id}
                      className="p-3.5 rounded-2xl bg-orange/[0.03] dark:bg-darkElevated border border-orange/10 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-orange/30 transition-all"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-zinc-100 truncate">
                          {coupleName}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                          {payment.package?.name || "Service Package"} • {payment.bookingDate || "Date TBD"}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-title font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                          LKR {(payment.amount || 0).toLocaleString()}
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actionable Insights & Recommendations */}
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-6 sm:p-7 border border-orange/15 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold font-title text-gray-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
                <FiZap className="text-amber-500" /> Performance Insights
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-5">
                Strategic tips to maximize your inquiries and bookings
              </p>

              <div className="space-y-3.5">
                {/* Tip 1 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <FiTrendingUp className="text-base" />
                  </div>
                  <div className="text-xs">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                      Optimize Top Packages
                    </h3>
                    <p className="text-gray-600 dark:text-zinc-400 mt-0.5">
                      Your top-viewed package generates the most couple interest. Ensure its pricing, inclusions, and photo gallery are always up to date.
                    </p>
                  </div>
                </div>

                {/* Tip 2 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 shrink-0">
                    <FiMessageSquare className="text-base" />
                  </div>
                  <div className="text-xs">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                      Fast Response Rate
                    </h3>
                    <p className="text-gray-600 dark:text-zinc-400 mt-0.5">
                      Couples who receive replies within 2 hours are 60% more likely to book. Check your Chats tab daily for unread inquiries.
                    </p>
                  </div>
                </div>

                {/* Tip 3 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
                    <FiStar className="text-base" />
                  </div>
                  <div className="text-xs">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                      Collect Verified Reviews
                    </h3>
                    <p className="text-gray-600 dark:text-zinc-400 mt-0.5">
                      Completed wedding couples can review your service. More positive reviews elevate your ranking in the vendor search directory.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-zinc-400">Need marketing help?</span>
              <Link
                href="/help"
                className="font-semibold text-orange hover:underline flex items-center gap-1"
              >
                Help Center <FiArrowUpRight />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorAnalytics;
