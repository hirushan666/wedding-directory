"use client";

import React, { useState, useMemo } from "react";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { TableSkeleton } from "@/components/ui/shimmer";
import Footer from "@/components/shared/Footer";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_PAYMENTS, GET_VENDOR_BY_ID } from "@/graphql/queries";
import Link from "next/link";
import toast from "react-hot-toast";
import { exportPaymentPDF, exportPaymentExcel } from "@/utils/paymentExport";
import {
  FiSearch,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiCalendar,
  FiUser,
  FiArrowUpRight,
  FiEye,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiChevronDown,
  FiFileText,
  FiFilter,
} from "react-icons/fi";
import { FaMoneyBillWave, FaFileExcel } from "react-icons/fa";
import { formatCoupleName } from "@/utils/formatCoupleName";

interface Payment {
  id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  bookingDate?: string | null;
  paymentReference?: string | null;
  gateway?: string | null;
  gatewayPaymentId?: string | null;
  visitor?: {
    id: string;
    visitor_fname: string;
    visitor_lname?: string;
    partner_fname?: string;
    email: string;
    phone?: string;
  } | null;
  package?: {
    id: string;
    name: string;
    service?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

const PaymentsPage = () => {
  const { vendor } = useVendorAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_VENDOR_PAYMENTS, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
    fetchPolicy: "network-only",
  });

  const { data: vendorData } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });
  const vendorInfo = vendorData?.findVendorById;

  // Filter ONLY completed payments (exclude failed and pending attempts)
  const payments: Payment[] = useMemo(() => {
    return (data?.vendorPayments || []).filter(
      (p: Payment) => p.status === "completed",
    );
  }, [data]);

  // Summary Metrics calculations
  const { totalRevenue, completedCount, scheduledCount, avgAdvance } =
    useMemo(() => {
      let total = 0;
      let scheduled = 0;

      payments.forEach((p) => {
        const amt = Number(p.amount) || 0;
        total += amt;
        if (p.bookingDate) scheduled++;
      });

      const count = payments.length;
      const avg = count > 0 ? total / count : 0;

      return {
        totalRevenue: total,
        completedCount: count,
        scheduledCount: scheduled,
        avgAdvance: avg,
      };
    }, [payments]);

  // Filtered Payments (search only)
  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments;

    const term = searchTerm.toLowerCase();
    return payments.filter((payment) => {
      const customerName = formatCoupleName(payment.visitor, "").toLowerCase();
      const email = (payment.visitor?.email || "").toLowerCase();
      const phone = (payment.visitor?.phone || "").toLowerCase();
      const serviceName = (payment.package?.service?.name || "").toLowerCase();
      const packageName = (payment.package?.name || "").toLowerCase();
      const orderRef = (
        payment.paymentReference ||
        payment.id ||
        ""
      ).toLowerCase();

      return (
        customerName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        serviceName.includes(term) ||
        packageName.includes(term) ||
        orderRef.includes(term)
      );
    });
  }, [payments, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 dark:bg-darkElevated text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
            {status}
          </span>
        );
    }
  };

  const formatLKR = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExport = async (
    format: "pdf" | "excel",
    filteredOnly = false,
  ) => {
    const listToExport = filteredOnly ? filteredPayments : payments;

    if (!listToExport || listToExport.length === 0) {
      toast.error("No payment records available to export.");
      setShowExportMenu(false);
      return;
    }

    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const filterLabel =
        filteredOnly && searchTerm
          ? `Filtered (Search: "${searchTerm}")`
          : "Confirmed Payments";

      if (format === "pdf") {
        exportPaymentPDF(listToExport, vendorInfo, {
          filteredOnly,
          filterLabel,
        });
        toast.success(
          filteredOnly
            ? `Downloaded PDF statement with ${listToExport.length} filtered records`
            : `Downloaded official PDF statement with ${listToExport.length} records`,
        );
      } else {
        exportPaymentExcel(listToExport, vendorInfo, {
          filteredOnly,
          filterLabel,
        });
        toast.success(
          filteredOnly
            ? `Downloaded Excel statement with ${listToExport.length} filtered records`
            : `Downloaded Excel statement with ${listToExport.length} records`,
        );
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex flex-col transition-colors duration-200 font-body">
        <VendorHeader />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
          <div className="space-y-2">
            <div className="h-8 w-56 rounded-lg bg-gray-200/80 dark:bg-darkElevated animate-pulse" />
            <div className="h-4 w-96 rounded bg-gray-200/80 dark:bg-darkElevated animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-darkSurface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-3"
              >
                <div className="h-4 w-28 rounded bg-gray-200/80 dark:bg-darkElevated animate-pulse" />
                <div className="h-8 w-32 rounded-lg bg-gray-200/80 dark:bg-darkElevated animate-pulse" />
                <div className="h-3 w-20 rounded bg-gray-200/80 dark:bg-darkElevated animate-pulse" />
              </div>
            ))}
          </div>
          <TableSkeleton rows={6} cols={5} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex flex-col transition-colors duration-200">
        <VendorHeader />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="bg-white dark:bg-darkSurface rounded-2xl p-8 border border-red-100 dark:border-red-900/30 text-center max-w-md shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-3">
              <FiAlertCircle size={24} />
            </div>
            <h2 className="text-lg font-title font-bold text-gray-900 dark:text-zinc-100 mb-1">
              Error Loading Payments
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-xs mb-4">
              {error.message}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 bg-orange text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-orange/90 transition-colors shadow-sm"
            >
              <FiRefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex flex-col transition-colors duration-200">
      <VendorHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-title text-3xl font-bold text-gray-900 dark:text-zinc-100">
                Payment History
              </h1>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
              Track your client 20% advance payments, verify transaction
              statuses, and review total revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Export Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="inline-flex items-center gap-2 bg-white dark:bg-darkSurface hover:bg-gray-50 dark:hover:bg-darkElevated text-gray-700 dark:text-zinc-300 font-medium px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 transition-all text-sm shadow-xs disabled:opacity-50"
                title="Download financial statement"
              >
                <FiDownload size={15} className="text-orange" />
                <span>
                  {isExporting ? "Generating..." : "Export Statement"}
                </span>
                <FiChevronDown
                  size={14}
                  className={`text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${
                    showExportMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-darkSurface rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800 mb-1">
                      <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                        Download Financial Statement
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        {filteredPayments.length !== payments.length
                          ? `Filtered view: ${filteredPayments.length} of ${payments.length} records`
                          : `Total records: ${payments.length}`}
                      </p>
                    </div>

                    {/* PDF Statement Option */}
                    <button
                      onClick={() => handleExport("pdf", false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange/5 dark:hover:bg-darkElevated text-left transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                        <FiFileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 group-hover:text-orange transition-colors">
                          PDF Statement (.pdf)
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500">
                          Official banking-style ledger
                        </div>
                      </div>
                    </button>

                    {/* Excel / CSV Option */}
                    <button
                      onClick={() => handleExport("excel", false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange/5 dark:hover:bg-darkElevated text-left transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <FaFileExcel size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800 dark:text-zinc-200 group-hover:text-orange transition-colors">
                          Excel / Spreadsheet (.csv)
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500">
                          Complete tabular CSV data
                        </div>
                      </div>
                    </button>

                    {/* Filtered Export Options */}
                    {filteredPayments.length !== payments.length && (
                      <div className="border-t border-gray-100 dark:border-zinc-800 my-1 pt-1.5">
                        <div className="px-3 py-1">
                          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                            Export Filtered Subset
                          </span>
                        </div>
                        <button
                          onClick={() => handleExport("pdf", true)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-darkElevated text-left text-xs text-gray-600 dark:text-zinc-400 hover:text-orange transition-colors"
                        >
                          <FiFilter
                            size={13}
                            className="text-orange flex-shrink-0"
                          />
                          <span className="truncate">
                            Export filtered PDF ({filteredPayments.length})
                          </span>
                        </button>
                        <button
                          onClick={() => handleExport("excel", true)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-darkElevated text-left text-xs text-gray-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors"
                        >
                          <FiFilter
                            size={13}
                            className="text-emerald-600 flex-shrink-0"
                          />
                          <span className="truncate">
                            Export filtered CSV ({filteredPayments.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 bg-white dark:bg-darkSurface hover:bg-gray-50 dark:hover:bg-darkElevated text-gray-700 dark:text-zinc-300 font-medium px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 transition-all text-sm shadow-xs"
              title="Refresh payments"
            >
              <FiRefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total Completed Revenue */}
          <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Completed Revenue
              </p>
              <h3 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {formatLKR(totalRevenue)}
              </h3>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <FiCheckCircle size={12} /> {completedCount} confirmed advance{" "}
                {completedCount === 1 ? "payment" : "payments"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <FaMoneyBillWave size={22} />
            </div>
          </div>

          {/* Card 2: Confirmed Bookings */}
          <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Confirmed Bookings
              </p>
              <h3 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {completedCount}
              </h3>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <FiCheckCircle size={12} /> Verified client reservations
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle size={22} />
            </div>
          </div>

          {/* Card 3: Scheduled Dates */}
          <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Scheduled Dates
              </p>
              <h3 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {scheduledCount}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Locked on your calendar
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center flex-shrink-0">
              <FiCalendar size={22} />
            </div>
          </div>

          {/* Card 4: Average Advance */}
          <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Avg. Advance (20%)
              </p>
              <h3 className="font-title text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {formatLKR(avgAdvance)}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Per confirmed booking
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Confirmed Payments ({filteredPayments.length})
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search customer, package, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:border-orange focus:bg-white dark:focus:bg-darkElevated transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Payments Records Container */}
        {filteredPayments.length > 0 ? (
          <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-darkElevated/60 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Service & Package</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Amount (20% Advance)</th>
                    <th className="py-3.5 px-6">Event Date</th>
                    <th className="py-3.5 px-6">Date Created</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                  {filteredPayments.map((payment) => {
                    const customerName = formatCoupleName(
                      payment.visitor,
                      "Wedding Couple",
                    );

                    return (
                      <tr
                        key={payment.id}
                        className="hover:bg-orange/5 dark:hover:bg-darkElevated/40 transition-colors"
                      >
                        {/* Service & Package */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900 dark:text-zinc-100">
                            {payment.package?.service?.name ||
                              "Wedding Service"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                            <span className="inline-block bg-gray-100 dark:bg-darkElevated px-2 py-0.5 rounded-md text-gray-700 dark:text-zinc-300 font-medium">
                              {payment.package?.name || "Package"}
                            </span>
                          </div>
                          {payment.paymentReference && (
                            <div className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono mt-1">
                              Ref: {payment.paymentReference}
                            </div>
                          )}
                        </td>

                        {/* Customer Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange/10 text-orange font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {customerName[0]?.toUpperCase() || "C"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                                {customerName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                {payment.visitor?.email || "No email"}
                              </div>
                              {payment.visitor?.phone && (
                                <div className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                                  {payment.visitor.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6">
                          <div className="font-title font-bold text-gray-900 dark:text-zinc-100 text-base">
                            {formatLKR(Number(payment.amount))}
                          </div>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            20% Advance Paid
                          </span>
                        </td>

                        {/* Event Booking Date */}
                        <td className="py-4 px-6">
                          {payment.bookingDate ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300 font-medium">
                              <FiCalendar className="text-orange" size={13} />
                              <span>
                                {new Date(
                                  payment.bookingDate,
                                ).toLocaleDateString(undefined, {
                                  dateStyle: "medium",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-zinc-500 italic">
                              Not scheduled
                            </span>
                          )}
                        </td>

                        {/* Date Created */}
                        <td className="py-4 px-6 text-xs text-gray-500 dark:text-zinc-400">
                          {new Date(payment.createdAt).toLocaleDateString(
                            undefined,
                            {
                              dateStyle: "medium",
                            },
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {getStatusBadge(payment.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-darkElevated hover:bg-orange dark:hover:bg-orange hover:text-white dark:hover:text-white text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-colors border border-gray-200 dark:border-zinc-700"
                          >
                            <FiEye size={13} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredPayments.map((payment) => {
                const customerName = formatCoupleName(
                  payment.visitor,
                  "Wedding Couple",
                );

                return (
                  <div key={payment.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
                          {payment.package?.service?.name || "Wedding Service"}
                        </span>
                        <h4 className="font-title font-bold text-gray-900 dark:text-zinc-100 text-base">
                          {payment.package?.name || "Package"}
                        </h4>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="bg-gray-50/70 dark:bg-darkElevated/60 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">
                          Customer:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-zinc-200">
                          {customerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">
                          Email:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-zinc-200 truncate max-w-[180px]">
                          {payment.visitor?.email || "N/A"}
                        </span>
                      </div>
                      {payment.bookingDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-zinc-400">
                            Event Date:
                          </span>
                          <span className="font-medium text-orange">
                            {new Date(payment.bookingDate).toLocaleDateString(
                              undefined,
                              {
                                dateStyle: "medium",
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[11px] text-gray-400 dark:text-zinc-500">
                          Advance Amount:
                        </div>
                        <div className="font-title font-bold text-gray-900 dark:text-zinc-100 text-base">
                          {formatLKR(Number(payment.amount))}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange text-white rounded-xl text-xs font-medium"
                      >
                        <FiEye size={13} /> View Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 sm:p-14 text-center max-w-xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-4">
              <FiCreditCard size={32} />
            </div>
            <h3 className="font-title text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              {searchTerm
                ? "No Matching Payments Found"
                : "No Confirmed Payments Yet"}
            </h3>
            <p className="text-gray-500 dark:text-zinc-400 font-body text-sm leading-relaxed mb-6">
              {searchTerm
                ? "Try clearing your search query to view all confirmed payment records."
                : "When couples book your wedding services and complete their 20% advance payment through PayHere, all confirmed transaction details and earnings will be listed here."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="w-full sm:w-auto px-5 py-2.5 bg-orange text-white rounded-xl font-medium text-sm hover:bg-orange/90 transition-colors shadow-sm"
                >
                  Clear Search
                </button>
              ) : (
                <>
                  <Link
                    href="/vendor-dashboard"
                    className="w-full sm:w-auto px-5 py-2.5 bg-orange text-white rounded-xl font-medium text-sm hover:bg-orange/90 transition-colors shadow-sm"
                  >
                    Go to Vendor Dashboard
                  </Link>
                  <Link
                    href="/vendor-dashboard/new-service"
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 dark:bg-darkElevated hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl font-medium text-sm transition-colors"
                  >
                    Add More Services
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Transaction Detail Receipt Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-darkSurface rounded-3xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-zinc-800 relative">
              <button
                onClick={() => setSelectedPayment(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
              >
                <FiX size={16} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-3">
                  <FiCreditCard size={24} />
                </div>
                <h3 className="font-title text-xl font-bold text-gray-900 dark:text-zinc-100">
                  Transaction Receipt
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
                  Ref: {selectedPayment.paymentReference || selectedPayment.id}
                </p>
              </div>

              {/* Receipt Amount Box */}
              <div className="bg-orange/5 dark:bg-orange/10 border border-orange/15 dark:border-orange/20 rounded-2xl p-4 text-center mb-5">
                <span className="text-xs text-orange font-semibold uppercase tracking-wider block mb-1">
                  Advance Amount Paid (20%)
                </span>
                <div className="font-title text-3xl font-bold text-gray-900 dark:text-zinc-100">
                  {formatLKR(Number(selectedPayment.amount))}
                </div>
                <div className="mt-2 flex items-center justify-center">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-zinc-300 mb-6">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-gray-400 dark:text-zinc-500">
                    Service
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 text-right">
                    {selectedPayment.package?.service?.name ||
                      "Wedding Service"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-gray-400 dark:text-zinc-500">
                    Package
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 text-right">
                    {selectedPayment.package?.name || "Selected Package"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-gray-400 dark:text-zinc-500">
                    Customer Name
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 text-right">
                    {formatCoupleName(
                      selectedPayment.visitor,
                      "Wedding Couple",
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-gray-400 dark:text-zinc-500">
                    Customer Email
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 text-right">
                    {selectedPayment.visitor?.email || "N/A"}
                  </span>
                </div>
                {selectedPayment.visitor?.phone && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-400 dark:text-zinc-500">
                      Customer Phone
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200 text-right">
                      {selectedPayment.visitor.phone}
                    </span>
                  </div>
                )}
                {selectedPayment.bookingDate && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-400 dark:text-zinc-500">
                      Event Date
                    </span>
                    <span className="font-semibold text-orange text-right">
                      {new Date(selectedPayment.bookingDate).toLocaleDateString(
                        undefined,
                        {
                          dateStyle: "full",
                        },
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-gray-400 dark:text-zinc-500">
                    Payment Gateway
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 uppercase text-right">
                    {selectedPayment.gateway || "PayHere"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 dark:text-zinc-500">
                    Created On
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 text-right">
                    {new Date(selectedPayment.createdAt).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-2.5 bg-gray-100 dark:bg-darkElevated hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 rounded-xl font-medium text-sm transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentsPage;
