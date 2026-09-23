"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_PAYMENTS, GET_VENDOR_APPROVAL_REQUESTS } from "@/graphql/queries";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiCheckCircle, FiClock, FiArrowRight } from "react-icons/fi";
import { formatCoupleName } from "@/utils/formatCoupleName";
import { Skeleton } from "@/components/ui/skeleton";

interface Payment {
  id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  bookingDate: string | null;
  visitor: {
    id: string;
    visitor_fname: string;
    visitor_lname?: string;
    partner_fname?: string;
    email: string;
    phone?: string;
  };
  package: {
    id: string;
    name: string;
    service: {
      id: string;
      name: string;
    };
  };
}

interface ApprovalRequestItem {
  id: string;
  bookingDate: string;
  userNote?: string;
  status: string;
  vendorMessage?: string;
  isExpired: boolean;
  createdAt: string;
  visitor?: {
    id: string;
    email: string;
    visitor_fname?: string;
    visitor_lname?: string;
    partner_fname?: string;
    phone?: string;
  };
  package?: {
    id: string;
    name: string;
    pricing: number;
    service?: {
      id: string;
      name: string;
    };
  };
}

const BookingCalendar: React.FC = () => {
  const { vendor } = useVendorAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data, loading, error } = useQuery(GET_VENDOR_PAYMENTS, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
  });

  const { data: approvalData } = useQuery(GET_VENDOR_APPROVAL_REQUESTS, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
    fetchPolicy: "cache-and-network",
  });

  const payments: Payment[] = data?.vendorPayments || [];
  const rawApprovalRequests: ApprovalRequestItem[] =
    approvalData?.getVendorApprovalRequests || [];

  // Filter ONLY completed payments with booking dates (exclude failed/cancelled attempts)
  const bookingsWithDates = payments.filter(
    (p) => p.bookingDate && p.status === "completed",
  );

  // Filter pending approval requests with booking dates (upcoming / active)
  const pendingRequests = rawApprovalRequests.filter(
    (r) => r.status === "pending" && !r.isExpired && r.bookingDate,
  );

  // Get bookings for selected date
  const getBookingsForDate = (date: Date) => {
    return bookingsWithDates.filter((p) => {
      const bookingDate = new Date(p.bookingDate!);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  // Get approval requests for selected date
  const getRequestsForDate = (date: Date) => {
    return pendingRequests.filter((r) => {
      const bDate = new Date(r.bookingDate);
      return bDate.toDateString() === date.toDateString();
    });
  };

  // Check if a date has bookings
  const hasBooking = (date: Date) => {
    return bookingsWithDates.some((p) => {
      const bookingDate = new Date(p.bookingDate!);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  // Get booking status for a date (only completed bookings are tracked)
  const getDateStatus = (date: Date) => {
    const dateBookings = getBookingsForDate(date);
    return dateBookings.length > 0 ? "completed" : null;
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate((prev) =>
      prev?.toDateString() === date.toDateString() ? null : date,
    );
  };

  const selectedDateBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : [];

  const selectedDateRequests = selectedDate
    ? getRequestsForDate(selectedDate)
    : [];

  if (loading) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-7 flex flex-col space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-xl" />
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-5 w-full rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-12 sm:h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 p-8 text-center text-red-500 text-sm">
        Error loading bookings. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 sm:p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="font-title text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100">
            Booking Calendar
          </h2>
          <p className="text-gray-400 dark:text-zinc-500 text-xs mt-0.5">
            Monitor client event dates and manage your availability
          </p>
        </div>

        {/* Legend / Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              {bookingsWithDates.length} Confirmed {bookingsWithDates.length === 1 ? "Booking" : "Bookings"}
            </span>
          </span>
          {pendingRequests.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse"></span>
              <span>
                {pendingRequests.length} Pending {pendingRequests.length === 1 ? "Request" : "Requests"}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Calendar Header with Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 hover:text-orange border border-gray-200 dark:border-zinc-700 hover:border-orange/30 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Previous Month"
        >
          <FiChevronLeft size={16} />
          <span>Prev</span>
        </button>
        <h3 className="text-base sm:text-lg font-title font-bold text-gray-900 dark:text-zinc-100">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-darkElevated hover:bg-orange/10 hover:text-orange border border-gray-200 dark:border-zinc-700 hover:border-orange/30 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Next Month"
        >
          <span>Next</span>
          <FiChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-bold text-gray-500 dark:text-zinc-400 py-1.5 text-xs sm:text-sm uppercase tracking-wider"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-12 sm:h-14" />;
          }

          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected =
            selectedDate?.toDateString() === date.toDateString();
          const dateBookings = getBookingsForDate(date);
          const dateRequests = getRequestsForDate(date);
          const isBooked = dateBookings.length > 0;
          const hasRequest = dateRequests.length > 0;

          // Cell background styling based on bookings and requests
          let cellStyle =
            "bg-white dark:bg-darkSurface border-gray-100 dark:border-zinc-800 hover:border-orange/30 hover:bg-orange/[0.02] dark:hover:bg-zinc-800/40";
          if (isBooked && hasRequest) {
            cellStyle =
              "bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/70 dark:from-emerald-950/30 dark:via-darkSurface dark:to-blue-950/30 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400";
          } else if (isBooked) {
            cellStyle =
              "bg-emerald-50/80 dark:bg-emerald-950/35 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60";
          } else if (hasRequest) {
            cellStyle =
              "bg-blue-50/80 dark:bg-blue-950/35 border-blue-300 dark:border-blue-800/80 hover:border-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-950/60";
          }

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`h-12 sm:h-14 p-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer group relative ${cellStyle} ${
                isSelected
                  ? "ring-2 ring-orange border-orange bg-orange/10 dark:bg-orange/20 shadow-xs z-10"
                  : isToday
                  ? "border-orange ring-1 ring-orange/40 bg-orange/[0.04] dark:bg-orange/[0.08]"
                  : ""
              }`}
            >
              {/* Date Number - Large, Bold & Clear */}
              <span
                className={`text-sm sm:text-base font-bold transition-colors ${
                  isToday
                    ? "text-orange font-extrabold"
                    : isSelected
                    ? "text-orange font-extrabold"
                    : isBooked
                    ? "text-emerald-900 dark:text-emerald-300 font-bold"
                    : hasRequest
                    ? "text-blue-900 dark:text-blue-300 font-bold"
                    : "text-gray-800 dark:text-zinc-200 group-hover:text-orange"
                }`}
              >
                {date.getDate()}
              </span>

              {/* Status Indicator Dots */}
              {(isBooked || hasRequest) && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  {/* Confirmed booking emerald dots (one dot per booking, e.g. 2 bookings = 2 dots) */}
                  {dateBookings.slice(0, 3).map((_, i) => (
                    <span
                      key={`bkg-${i}`}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shrink-0"
                      title="Confirmed Booking"
                    />
                  ))}
                  {dateBookings.length > 3 && (
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 leading-none">
                      +{dateBookings.length - 3}
                    </span>
                  )}
                  {/* Pending approval request blue dot(s) */}
                  {dateRequests.slice(0, 2).map((_, i) => (
                    <span
                      key={`req-${i}`}
                      className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-xs shrink-0 animate-pulse"
                      title="Pending Approval Request"
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Bookings & Requests Details */}
      {selectedDate && (
        <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50/70 dark:bg-darkElevated/40 mt-4 transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60 dark:border-zinc-700/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
                <FiCalendar size={15} />
              </div>
              <h4 className="font-title font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100">
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedDateBookings.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedDateBookings.length}{" "}
                  {selectedDateBookings.length === 1 ? "Booking" : "Bookings"}
                </span>
              )}
              {selectedDateRequests.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedDateRequests.length}{" "}
                  {selectedDateRequests.length === 1 ? "Request" : "Requests"}
                </span>
              )}
              {selectedDateBookings.length === 0 &&
                selectedDateRequests.length === 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                    Available
                  </span>
                )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Pending Approval Requests */}
            {selectedDateRequests.length > 0 && (
              <div className="space-y-2">
                {selectedDateRequests.map((req) => {
                  const receivedTime = req.createdAt
                    ? new Date(req.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : null;

                  return (
                    <div
                      key={req.id}
                      className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 shadow-2xs text-xs sm:text-sm hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-zinc-100 truncate text-sm sm:text-base">
                              {formatCoupleName(req.visitor, "Couple")}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              Pending Approval
                            </span>
                          </div>

                          {receivedTime && (
                            <div className="flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-300 mt-1 font-medium">
                              <FiClock size={12} className="shrink-0" />
                              <span>Request received: {receivedTime}</span>
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-600 dark:text-zinc-300 bg-white/80 dark:bg-darkSurface/80 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                            <div>
                              <span className="text-[11px] text-gray-400 dark:text-zinc-500 block uppercase tracking-wider font-semibold">
                                Requested Package
                              </span>
                              <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate block text-xs sm:text-sm">
                                {req.package?.name || "Package"}{" "}
                                {req.package?.service?.name
                                  ? `(${req.package.service.name})`
                                  : ""}
                              </span>
                            </div>
                            {req.userNote && (
                              <p className="mt-1.5 text-xs text-gray-500 dark:text-zinc-400 italic">
                                &ldquo;{req.userNote}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <a
                            href="/vendor-dashboard?tab=approvals"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                          >
                            <span>Respond</span>
                            <FiArrowRight size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirmed Bookings */}
            {selectedDateBookings.length > 0 && (
              <div className="space-y-2">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-darkSurface border border-gray-100 dark:border-zinc-700/80 rounded-xl p-3.5 shadow-2xs text-xs sm:text-sm hover:border-orange/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-zinc-100 truncate text-sm sm:text-base">
                            {formatCoupleName(booking.visitor, "Couple")}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                            <FiCheckCircle size={11} /> Confirmed
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5 font-body">
                          {booking.visitor.email}
                        </div>

                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-darkElevated/50 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800/60">
                          <div>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 block uppercase tracking-wider font-semibold">
                              Service
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate block text-xs sm:text-sm">
                              {booking.package?.service?.name || "Wedding Service"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 block uppercase tracking-wider font-semibold">
                              Package
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate block text-xs sm:text-sm">
                              {booking.package?.name || "Package"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-zinc-500 block font-medium">
                          Advance Paid
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange/10 text-orange font-bold text-xs sm:text-sm mt-0.5">
                          LKR{" "}
                          {booking.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completely Available */}
            {selectedDateBookings.length === 0 &&
              selectedDateRequests.length === 0 && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 italic py-1">
                  You currently have no bookings or requests scheduled on this date. Your calendar is open!
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
