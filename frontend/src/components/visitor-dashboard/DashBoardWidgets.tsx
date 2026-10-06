import React from "react";
import Link from "next/link";
import VendorWidget from "./widgets/VendorWidget";
import GuestListWidget from "./widgets/GuestListWidget";
import BudgetWidget from "./widgets/BudgetWidget";
import ChecklistWidget from "./widgets/ChecklistWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import ChatWidget from "./widgets/ChatWidget";
import {
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiBookmark,
  FiChevronRight,
} from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { BsChatDots } from "react-icons/bs";

export interface Vendor {
  id: string;
  offering: {
    name: string;
    banner?: string;
    vendor: {
      busname: string;
    };
  };
}

interface DashboardWidgetsProps {
  myVendors: Vendor[];
  attendingGuests: number;
  declinedGuests: number;
  invitedGuests: number;
  notInvitedGuests: number;
  totalGuests: number;
  budgetTotal: number;
  budgetSpent: number;
  budgetPercentage: number;
  completedTasks: number;
  totalTasks: number;
  checklistProgress: number;
  visitorId: string | undefined;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  myVendors,
  attendingGuests,
  declinedGuests,
  invitedGuests,
  notInvitedGuests,
  totalGuests,
  budgetTotal,
  budgetSpent,
  budgetPercentage,
  completedTasks,
  totalTasks,
  checklistProgress,
  visitorId,
}) => {
  return (
    <>
      {/* Mobile View: Compact 2-Column Mini-Widget Grid (< lg) */}
      <div className="lg:hidden grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
        {/* 1. Checklist Mini-Widget */}
        <Link
          href={`/visitor-dashboard/checklist/${visitorId || ""}`}
          className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-3 sm:p-3.5 hover:border-orange/40 transition-all shadow-xs flex flex-col justify-between active:scale-[0.98] group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center">
                <IoMdCheckmarkCircleOutline className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-orange bg-orange/10 dark:bg-orange/20 px-1.5 py-0.5 rounded-md">
                {checklistProgress}%
              </span>
            </div>
            <h4 className="font-title text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors truncate">
              Checklist
            </h4>
            <p className="font-title font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100 mt-0.5">
              {completedTasks}/{totalTasks}
              <span className="text-[10px] font-normal text-gray-500 dark:text-zinc-400 ml-1 font-body">done</span>
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <div className="w-full bg-orange/10 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-1.5">
              <div
                className="h-full bg-orange rounded-full transition-all duration-300"
                style={{ width: `${Math.min(checklistProgress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-orange transition-colors flex items-center gap-0.5 font-medium">
              Manage tasks <FiChevronRight size={10} />
            </span>
          </div>
        </Link>

        {/* 2. Budget Tracker Mini-Widget */}
        <Link
          href={`/visitor-dashboard/budgeter/${visitorId || ""}`}
          className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-3 sm:p-3.5 hover:border-orange/40 transition-all shadow-xs flex flex-col justify-between active:scale-[0.98] group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center">
                <FiDollarSign className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-orange bg-orange/10 dark:bg-orange/20 px-1.5 py-0.5 rounded-md">
                {budgetPercentage}%
              </span>
            </div>
            <h4 className="font-title text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors truncate">
              Budget
            </h4>
            <p className="font-title font-bold text-xs sm:text-sm text-gray-900 dark:text-zinc-100 mt-0.5 truncate">
              {budgetTotal > 0 ? (
                <>
                  LKR {budgetSpent >= 1_000_000 ? `${(budgetSpent / 1_000_000).toFixed(1)}M` : budgetSpent >= 1_000 ? `${(budgetSpent / 1_000).toFixed(0)}k` : budgetSpent}
                </>
              ) : (
                <span className="text-[11px] font-normal text-gray-400">Set budget</span>
              )}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <div className="w-full bg-orange/10 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${budgetPercentage > 90 ? "bg-rose-500" : "bg-orange"}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-orange transition-colors flex items-center gap-0.5 font-medium">
              Track expenses <FiChevronRight size={10} />
            </span>
          </div>
        </Link>

        {/* 3. Guest List Mini-Widget */}
        <Link
          href="/guest-list"
          className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-3 sm:p-3.5 hover:border-orange/40 transition-all shadow-xs flex flex-col justify-between active:scale-[0.98] group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center">
                <FiUsers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-orange bg-orange/10 dark:bg-orange/20 px-1.5 py-0.5 rounded-md">
                {attendingGuests} RSVP
              </span>
            </div>
            <h4 className="font-title text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors truncate">
              Guest List
            </h4>
            <p className="font-title font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100 mt-0.5">
              {attendingGuests}
              <span className="text-[10px] font-normal text-gray-500 dark:text-zinc-400 ml-1 font-body">attending</span>
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mb-1">
              {totalGuests > 0 ? `${totalGuests} on invite list` : "No guests added"}
            </p>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-orange transition-colors flex items-center gap-0.5 font-medium">
              Manage RSVPs <FiChevronRight size={10} />
            </span>
          </div>
        </Link>

        {/* 4. Saved Vendors Mini-Widget */}
        <Link
          href={`/visitor-dashboard/my-vendors/${visitorId || ""}`}
          className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-3 sm:p-3.5 hover:border-orange/40 transition-all shadow-xs flex flex-col justify-between active:scale-[0.98] group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center">
                <FiBookmark className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-orange bg-orange/10 dark:bg-orange/20 px-1.5 py-0.5 rounded-md">
                {myVendors.length}
              </span>
            </div>
            <h4 className="font-title text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors truncate">
              My Vendors
            </h4>
            <p className="font-title font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100 mt-0.5">
              {myVendors.length}
              <span className="text-[10px] font-normal text-gray-500 dark:text-zinc-400 ml-1 font-body">saved</span>
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mb-1">
              {myVendors.length > 0 ? "Shortlisted services" : "Browse directory"}
            </p>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-orange transition-colors flex items-center gap-0.5 font-medium">
              View vendors <FiChevronRight size={10} />
            </span>
          </div>
        </Link>

        {/* 5. Calendar Mini-Widget */}
        <Link
          href="/visitor-dashboard?tab=calendar"
          className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-3 sm:p-3.5 hover:border-orange/40 transition-all shadow-xs flex flex-col justify-between active:scale-[0.98] group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center">
                <FiCalendar className="w-4 h-4" />
              </div>
            </div>
            <h4 className="font-title text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors truncate">
              Calendar
            </h4>
            <p className="font-title font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100 mt-0.5">
              Schedule
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mb-1">
              Appointments & dates
            </p>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-orange transition-colors flex items-center gap-0.5 font-medium">
              Open calendar <FiChevronRight size={10} />
            </span>
          </div>
        </Link>

        {/* 6. Chat Mini-Widget */}
        <Link
          href={`/visitor-dashboard/chats/${visitorId || ""}`}
          className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-3 sm:p-3.5 hover:border-orange/40 transition-all shadow-xs flex flex-col justify-between active:scale-[0.98] group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center">
                <BsChatDots className="w-4 h-4" />
              </div>
            </div>
            <h4 className="font-title text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors truncate">
              Messages
            </h4>
            <p className="font-title font-bold text-sm sm:text-base text-gray-900 dark:text-zinc-100 mt-0.5">
              Chats
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mb-1">
              Vendor inquiries
            </p>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-orange transition-colors flex items-center gap-0.5 font-medium">
              Open chats <FiChevronRight size={10} />
            </span>
          </div>
        </Link>
      </div>

      {/* Desktop View: Full 6 Widgets Grid (>= lg) - Kept 100% as is */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-rows-3 h-full flex-1">
        <VendorWidget vendors={myVendors} visitorId={visitorId} />

        <GuestListWidget
          attendingGuests={attendingGuests}
          declinedGuests={declinedGuests}
          invitedGuests={invitedGuests}
          notInvitedGuests={notInvitedGuests}
          totalGuests={totalGuests}
        />

        <BudgetWidget
          budgetTotal={budgetTotal}
          budgetSpent={budgetSpent}
          budgetPercentage={budgetPercentage}
          visitorId={visitorId}
        />

        <ChecklistWidget
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          checklistProgress={checklistProgress}
          visitorId={visitorId}
        />

        <CalendarWidget visitorId={visitorId} />

        <ChatWidget visitorId={visitorId} />
      </div>
    </>
  );
};

export default DashboardWidgets;
