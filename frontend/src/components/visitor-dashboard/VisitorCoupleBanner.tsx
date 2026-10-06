"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ProfilePicture from "./ProfilePicture";
import { StaticImageData } from "next/image";
import {
  FiHome,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiChevronRight,
  FiCalendar,
  FiBookmark,
  FiGrid,
  FiLayers,
} from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { BsChatDots } from "react-icons/bs";
import { Sparkles } from "lucide-react";

interface VisitorCoupleBannerProps {
  visitorData: {
    visitor_fname?: string;
    visitor_lname?: string;
    partner_fname?: string;
    wed_date?: string;
  } | null | undefined;
  visitorId: string | undefined;
  profilePic: string | StaticImageData;
  setProfilePic: React.Dispatch<React.SetStateAction<string | StaticImageData>>;
  completedTasks: number;
  totalTasks: number;
  budgetPercentage: number;
  myVendorsCount: number;
  attendingGuests: number;
  mobileTab?: "overview" | "tools";
  setMobileTab?: (tab: "overview" | "tools") => void;
}

const VisitorCoupleBanner: React.FC<VisitorCoupleBannerProps> = ({
  visitorData,
  visitorId,
  profilePic,
  setProfilePic,
  completedTasks,
  totalTasks,
  budgetPercentage,
  myVendorsCount,
  attendingGuests,
  mobileTab = "overview",
  setMobileTab,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Calculate days left
  const weddingDate = visitorData?.wed_date;
  const calculateDaysLeft = () => {
    if (!weddingDate) return 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const timeDifference = wedding.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeft = calculateDaysLeft();

  const formattedWeddingDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const userFname = visitorData?.visitor_fname?.trim() || "";
  const partnerFname = visitorData?.partner_fname?.trim() || "";

  const navigationItems = [
    {
      href: "/visitor-dashboard",
      icon: FiHome,
      title: "Dashboard",
      shortTitle: "Dashboard",
      subtitle: "Planning Overview",
      badge: null,
      isActive: pathname === "/visitor-dashboard" && tabParam !== "calendar",
    },
    {
      href: "/visitor-dashboard?tab=calendar",
      icon: FiCalendar,
      title: "Wedding Calendar",
      shortTitle: "Calendar",
      subtitle: "Appointments & Schedule",
      badge: null,
      isActive: pathname === "/visitor-dashboard" && tabParam === "calendar",
    },
    {
      href: `/visitor-dashboard/checklist/${visitorId || ""}`,
      icon: IoMdCheckmarkCircleOutline,
      title: "Checklist",
      shortTitle: "Checklist",
      subtitle: "Milestones & tasks",
      badge: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : null,
      isActive: pathname.startsWith("/visitor-dashboard/checklist"),
    },
    {
      href: `/visitor-dashboard/budgeter/${visitorId || ""}`,
      icon: FiDollarSign,
      title: "Budgeter",
      shortTitle: "Budgeter",
      subtitle: "Track allocations",
      badge: budgetPercentage > 0 ? `${Math.round(budgetPercentage)}%` : null,
      isActive: pathname.startsWith("/visitor-dashboard/budgeter"),
    },
    {
      href: "/guest-list",
      icon: FiUsers,
      title: "Guest List",
      shortTitle: "Guest List",
      subtitle: "Manage RSVPs",
      badge: attendingGuests > 0 ? `${attendingGuests} RSVP` : null,
      isActive: pathname.startsWith("/guest-list"),
    },
    {
      href: `/visitor-dashboard/my-vendors/${visitorId || ""}`,
      icon: FiBookmark,
      title: "Saved Services",
      shortTitle: "Saved",
      subtitle: "Shortlisted services",
      badge: myVendorsCount > 0 ? `${myVendorsCount}` : null,
      isActive: pathname.startsWith("/visitor-dashboard/my-vendors"),
    },
    {
      href: `/visitor-dashboard/chats/${visitorId || ""}`,
      icon: BsChatDots,
      title: "Chats",
      shortTitle: "Chats",
      subtitle: "Vendor conversations",
      badge: null,
      isActive: pathname.startsWith("/visitor-dashboard/chats"),
    },
    {
      href: "/visitor-dashboard/recommendations",
      icon: Sparkles,
      title: "Smart Picks",
      shortTitle: "Smart Picks",
      subtitle: "Curated for you",
      badge: "AI",
      isActive: pathname.startsWith("/visitor-dashboard/recommendations"),
    },
    {
      href: "/visitor-dashboard/payments-history",
      icon: FiClock,
      title: "Payments History",
      shortTitle: "Payments",
      subtitle: "Deposits & receipts",
      badge: null,
      isActive: pathname.startsWith("/visitor-dashboard/payments-history"),
    },
  ];

  const mobileNavigationItems = navigationItems.filter(
    (item) => item.href !== "/visitor-dashboard"
  );

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE VIEW (< lg): Separated into 2 parts like Overview */}
      {/* ======================================================== */}
      <div className="lg:hidden w-full flex flex-col gap-4">
        {/* Mobile Part 1: Couple Banner Card */}
        <div className="w-full bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 p-3.5 flex flex-col gap-2.5 transition-colors duration-200">
          <div className="flex items-center gap-3 text-left">
            {/* Compact Photo */}
            <ProfilePicture
              profilePic={profilePic}
              setProfilePic={setProfilePic}
              compact={true}
              className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm cursor-pointer group border border-orange/25 bg-gray-50 shrink-0"
            />

            {/* Names and Countdown */}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-orange uppercase tracking-wider block leading-tight">
                The Marriage Of
              </span>
              <h2 className="font-marck text-xl text-gray-900 dark:text-zinc-100 truncate leading-snug">
                {userFname && partnerFname ? (
                  <>
                    {userFname} <span className="text-orange font-title text-base mx-1 font-normal">&</span> {partnerFname}
                  </>
                ) : (
                  userFname ? `${userFname}'s Wedding` : "Our Wedding"
                )}
              </h2>

              {weddingDate ? (
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-orange/10 dark:bg-orange/20 border border-orange/20 text-orange">
                  <FiCalendar size={11} className="shrink-0" />
                  <span className="font-title font-bold text-xs">{daysLeft} Days to go</span>
                  {formattedWeddingDate && (
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-body">
                      • {formattedWeddingDate}
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  href="/visitor-profile"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-orange hover:underline mt-0.5"
                >
                  <FiCalendar size={11} />
                  <span>+ Set wedding date</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Segmented Toggle (Overview vs All Tools) */}
          {setMobileTab && (
            <div className="w-full bg-orange/[0.06] dark:bg-darkElevated/60 p-1 rounded-xl flex items-center border border-orange/15 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setMobileTab("overview")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-title font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileTab === "overview"
                    ? "bg-orange text-white shadow-xs"
                    : "text-gray-600 dark:text-zinc-400 hover:text-orange"
                }`}
              >
                <FiGrid size={13} />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("tools")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-title font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobileTab === "tools"
                    ? "bg-orange text-white shadow-xs"
                    : "text-gray-600 dark:text-zinc-400 hover:text-orange"
                }`}
              >
                <FiLayers size={13} />
                <span>All Tools (8)</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Part 2: All Tools Card (Rendered when mobileTab === 'tools') */}
        {mobileTab === "tools" && (
          <div className="w-full bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 p-3.5 flex flex-col transition-colors duration-200">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <h3 className="font-title text-xs font-bold text-gray-900 dark:text-zinc-200 uppercase tracking-wider">
                Planning Portal Navigation
              </h3>
              <span className="text-[10px] text-orange font-semibold bg-orange/10 dark:bg-orange/20 px-2 py-0.5 rounded-md">
                8 Tools
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mobileNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive;
                const isSmartPicks = item.title === "Smart Picks";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    className={`relative group flex items-center gap-2.5 p-2 rounded-xl border transition-all active:scale-[0.98] overflow-hidden ${
                      isActive
                        ? isSmartPicks
                          ? "bg-gradient-to-r from-orange/20 via-orange/10 to-amber-500/15 border-orange shadow-xs text-orange"
                          : "bg-orange/[0.08] dark:bg-orange/[0.16] border-orange shadow-xs text-orange"
                        : isSmartPicks
                          ? "bg-gradient-to-r from-orange/[0.06] via-amber-500/[0.04] to-transparent dark:from-orange/[0.14] dark:to-darkElevated border-orange/40 hover:border-orange text-gray-800 dark:text-zinc-100"
                          : "bg-gray-50/70 dark:bg-darkElevated/40 border-gray-100 dark:border-zinc-800/80 hover:border-orange/30 hover:bg-orange/5 text-gray-700 dark:text-zinc-300"
                    }`}
                  >
                    {/* Continuous subtle shimmer for Smart Picks AI */}
                    {isSmartPicks && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent skew-x-[-25deg] animate-shimmer" />
                      </div>
                    )}

                    {/* Icon box */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all relative z-10 ${
                        isActive
                          ? "bg-orange text-white shadow-xs shadow-orange/30"
                          : isSmartPicks
                            ? "bg-gradient-to-br from-orange to-amber-500 text-white shadow-xs shadow-orange/30 group-hover:scale-105"
                            : "bg-orange/10 dark:bg-orange/20 text-orange group-hover:bg-orange group-hover:text-white"
                      }`}
                    >
                      <Icon size={16} className={isSmartPicks ? "animate-pulse" : ""} />
                    </div>

                    {/* Text & Badge */}
                    <div className="min-w-0 flex-1 flex flex-col relative z-10">
                      <div className="flex items-center gap-1 justify-between">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isActive
                              ? "text-orange dark:text-orange font-bold"
                              : isSmartPicks
                                ? "text-gray-900 dark:text-zinc-100 font-bold"
                                : "text-gray-800 dark:text-zinc-200"
                          }`}
                        >
                          {item.shortTitle || item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 flex items-center gap-0.5 ${
                              isSmartPicks
                                ? "bg-gradient-to-r from-orange to-amber-500 text-white shadow-xs"
                                : isActive
                                  ? "bg-orange text-white"
                                  : "bg-orange/15 dark:bg-orange/25 text-orange"
                            }`}
                          >
                            {isSmartPicks && <Sparkles size={7} className="text-amber-100" />}
                            <span>{item.badge}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 truncate leading-tight mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DESKTOP VIEW (>= lg): Single Unified Sidebar Card        */}
      {/* ======================================================== */}
      <div className="hidden lg:flex w-full h-full bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/20 p-7 flex-col items-center text-center transition-colors duration-200">
        {/* Couple Photo Upload Card */}
        <div className="w-full flex justify-center mb-5">
          <ProfilePicture profilePic={profilePic} setProfilePic={setProfilePic} />
        </div>

        {/* Couple Header / Marriage Names */}
        <div className="mb-4">
          {userFname && partnerFname ? (
            <>
              <span className="text-[11px] font-semibold text-orange uppercase tracking-wider block mb-1">
                The Marriage Of
              </span>
              <h2 className="font-marck text-3xl sm:text-4xl text-gray-900 dark:text-zinc-100 leading-tight">
                {userFname}
                <span className="text-orange font-title text-2xl mx-2 font-normal">&</span>
                {partnerFname}
              </h2>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-orange uppercase tracking-wider block mb-1">
                Wedding Planning
              </span>
              <h2 className="font-marck text-3xl sm:text-4xl text-gray-900 dark:text-zinc-100 leading-tight">
                {userFname ? `${userFname}'s Wedding` : "Our Wedding"}
              </h2>
              <Link
                href="/visitor-profile"
                className="inline-block text-xs font-medium text-orange hover:underline mt-1 transition-colors"
              >
                + Add partner&apos;s name
              </Link>
            </>
          )}
        </div>

        {/* Countdown Card matching vendor profile detail cards */}
        <div className="w-full bg-orange/[0.04] dark:bg-orange/[0.08] border border-orange/20 rounded-2xl p-4 mb-6 text-center">
          {weddingDate ? (
            <>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 font-medium mb-1">
                <FiCalendar size={13} className="text-orange" />
                <span>Days Until The Wedding</span>
              </div>
              <div className="font-title text-3xl sm:text-4xl font-bold text-orange">
                {daysLeft}{" "}
                <span className="text-sm font-normal text-gray-600 dark:text-zinc-400">
                  {daysLeft === 1 ? "Day" : "Days"}
                </span>
              </div>
              {formattedWeddingDate && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-body">
                  Date: {formattedWeddingDate}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300 font-semibold mb-2.5">
                <FiCalendar size={14} className="text-orange" />
                <span>Wedding date is not set</span>
              </div>
              <Link
                href="/visitor-profile"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-orange hover:bg-orange/90 text-white shadow-sm shadow-orange/20 transition-all active:scale-[0.98]"
              >
                <FiCalendar size={13} />
                <span>Set Wedding Date</span>
              </Link>
            </div>
          )}
        </div>

        {/* Integrated Planning Navigation Menu (Desktop) */}
        <div className="w-full text-left transition-all">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h3 className="font-title text-xs font-bold text-gray-900 dark:text-zinc-200 uppercase tracking-wider">
              Planning Portal Navigation
            </h3>
            <span className="text-[10px] text-orange font-semibold bg-orange/10 dark:bg-orange/20 px-2 py-0.5 rounded-md">
              9 Tools
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              const isSmartPicks = item.title === "Smart Picks";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all overflow-hidden ${
                    isActive
                      ? isSmartPicks
                        ? "bg-gradient-to-r from-orange via-orange to-amber-600 text-white border-orange shadow-[0_0_20px_rgba(252,123,84,0.6)]"
                        : "bg-orange text-white border-orange shadow-sm"
                      : isSmartPicks
                        ? "bg-gradient-to-r from-orange/[0.08] via-amber-500/[0.06] to-orange/[0.10] dark:from-orange/[0.18] dark:via-darkElevated dark:to-orange/[0.14] border-orange/50 dark:border-orange/60 animate-pulse-glow hover:border-orange text-gray-800 dark:text-zinc-100"
                        : "border-gray-100 dark:border-zinc-800 hover:border-orange/30 hover:bg-orange/5 dark:hover:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 hover:text-orange"
                  }`}
                >
                  {/* Continuous subtle shimmer light sweep for Smart Picks AI */}
                  {isSmartPicks && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 dark:via-white/10 to-transparent skew-x-[-25deg] animate-shimmer" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 min-w-0 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive
                          ? "bg-white/20 text-white"
                          : isSmartPicks
                            ? "bg-gradient-to-br from-orange to-amber-500 text-white shadow-sm shadow-orange/40 group-hover:scale-105"
                            : "bg-orange/10 dark:bg-orange/20 text-orange group-hover:bg-orange group-hover:text-white"
                      }`}
                    >
                      <Icon size={16} className={isSmartPicks ? "animate-pulse" : ""} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5 ${
                          isActive
                            ? "text-white"
                            : isSmartPicks
                              ? "text-gray-900 dark:text-zinc-100 font-bold group-hover:text-orange"
                              : "text-gray-900 dark:text-zinc-200 group-hover:text-orange"
                        }`}
                      >
                        <span>{item.title}</span>
                        {isSmartPicks && !isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping" />
                        )}
                      </div>
                      <div
                        className={`text-[11px] truncate ${
                          isActive
                            ? "text-white/80"
                            : isSmartPicks
                              ? "text-orange dark:text-orange/90 font-medium"
                              : "text-gray-400 dark:text-zinc-500"
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2 relative z-10">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isActive
                            ? "bg-white text-orange shadow-xs"
                            : isSmartPicks
                              ? "bg-gradient-to-r from-orange to-amber-500 text-white shadow-[0_0_10px_rgba(252,123,84,0.6)] animate-pulse"
                              : "bg-orange/10 dark:bg-orange/20 text-orange group-hover:bg-orange group-hover:text-white"
                        }`}
                      >
                        {isSmartPicks && <Sparkles size={10} className="text-amber-100" />}
                        <span>{item.badge}</span>
                      </span>
                    )}
                    <FiChevronRight
                      className={`transition-transform duration-200 group-hover:translate-x-0.5 ${
                        isActive
                          ? "text-white"
                          : isSmartPicks
                            ? "text-orange dark:text-orange/80 group-hover:text-orange"
                            : "text-gray-300 dark:text-zinc-600 group-hover:text-orange"
                      }`}
                      size={14}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default VisitorCoupleBanner;
