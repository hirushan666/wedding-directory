"use client";
import React, { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IoIosNotificationsOutline } from "react-icons/io";
import { BiMessageRounded } from "react-icons/bi";
import {
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiGrid,
  FiLayers,
  FiBarChart2,
  FiCreditCard,
  FiHelpCircle,
} from "react-icons/fi";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image";
import { useVendorAuth } from "@/contexts/VendorAuthContext"; // Added vendor auth context
import { useTheme } from "@/contexts/ThemeContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID, GET_VENDOR_APPROVAL_REQUESTS } from "@/graphql/queries";
import toast from "react-hot-toast";
import { formatCoupleName } from "@/utils/formatCoupleName";

const VendorHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, vendor } = useVendorAuth(); // Added logout function from vendor auth context
  const { theme, toggleTheme } = useTheme();
  const isSignupForm =
    pathname === "/vendor-onboarding" ||
    pathname.startsWith("/vendor-onboarding") ||
    pathname === "/sign-up" ||
    pathname === "/vendor-signup";
  const [showProfileMenu, setShowProfileMenu] = useState(false); // State for the profile dropdown
  const [showNotificationMenu, setShowNotificationMenu] = useState(false); // State for notifications dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);
  const headerRef = useRef<HTMLElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Keep track of header height dynamically for the backdrop overlay
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const navLinks = [
    {
      name: "Dashboard",
      icon: FiGrid,
      href: "/vendor-dashboard",
      isActive: (path: string) => path === "/vendor-dashboard",
    },
    {
      name: "My Services",
      icon: FiLayers,
      href: "/vendor-dashboard/services",
      isActive: (path: string) =>
        path.startsWith("/vendor-dashboard/services") ||
        path.startsWith("/vendor-dashboard/new-service") ||
        path.startsWith("/services/edit"),
    },
    {
      name: "Analytics",
      icon: FiBarChart2,
      href: "/vendor-dashboard/analytics",
      isActive: (path: string) => path.startsWith("/vendor-dashboard/analytics"),
    },
    {
      name: "Payments",
      icon: FiCreditCard,
      href: "/vendor-dashboard/payments",
      isActive: (path: string) => path.startsWith("/vendor-dashboard/payments"),
    },
    {
      name: "Settings",
      icon: FiSettings,
      href: "/vendor-dashboard/settings",
      isActive: (path: string) => path.startsWith("/vendor-dashboard/settings"),
    },
    {
      name: "Help",
      icon: FiHelpCircle,
      href: "/vendor-dashboard/help",
      isActive: (path: string) => path === "/vendor-dashboard/help" || path === "/help",
    },
  ];

  const { data } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
    onError: (err) => {
      console.warn("Failed to load vendor header info:", err.message);
    },
  });

  // Query approval requests with polling for real-time notification
  const { data: approvalData } = useQuery(GET_VENDOR_APPROVAL_REQUESTS, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id || isSignupForm,
    pollInterval: 10000,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    onError: (err) => {
      console.warn("Failed to load vendor approval notifications:", err.message);
    },
  });

  const approvalRequests = approvalData?.getVendorApprovalRequests || [];
  const pendingRequests = approvalRequests.filter(
    (r: any) => r.status === "pending"
  );
  const pendingCount = pendingRequests.length;

  // Real-time toast alert when a new approval request arrives
  useEffect(() => {
    if (previousCountRef.current !== null && pendingCount > previousCountRef.current) {
      const latest = pendingRequests[0];
      const visitorName = formatCoupleName(latest?.visitor, "A couple");
      const pkgName = latest?.package?.name || "Package";

      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/vendor-dashboard?tab=approvals");
            }}
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex cursor-pointer hover:bg-orange/5 transition-all p-4 border-l-4 border-orange border border-gray-100`}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="w-9 h-9 rounded-full bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
                <IoIosNotificationsOutline size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900">
                  New Package Approval Request!
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-800">{visitorName}</span> requested{" "}
                  <span className="font-semibold text-gray-800">{pkgName}</span>. Click to review.
                </p>
              </div>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    }
    previousCountRef.current = pendingCount;
  }, [pendingCount, pendingRequests, router]);

  const profilePic = data?.findVendorById?.profile_pic_url || "/images/visitorPlaceholder.png";

  // WebSocket hook for unread count
  const { unreadCount } = useChatSocket(vendor?.id, "vendor");

  // Handle dropdown toggle
  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false); // Close the menu after logging out
  };

  // Close the dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setShowNotificationMenu(false);
      }
    };

    if (showProfileMenu || showNotificationMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, showNotificationMenu]);

  return (
    <Fragment>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 py-3.5 xl:py-4 text-black dark:text-white bg-lightYellow/95 dark:bg-darkBg/95 backdrop-blur-md border-b border-orange/15 dark:border-orange/20 transition-all duration-200 shadow-xs relative"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 w-full gap-4">
          {/* Left section: Hamburger button + Logo */}
          <div className="flex items-center gap-2 select-none shrink-0">
            {/* Mobile menu toggle (Far Left, lg:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange/40 cursor-pointer"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="vendor-mobile-dropdown"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6 transition-transform duration-200" />
              ) : (
                <HiMenu className="w-6 h-6 transition-transform duration-200" />
              )}
            </button>

            {/* Logo - click disabled for logged-in vendor */}
            <div className="flex items-start justify-start cursor-default">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 font-title">
                  Say I Do
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange -mt-0.5">Vendors</p>
              </div>
            </div>
          </div>

          {/* Center section: Navigation (Desktop only) */}
          <nav className="hidden lg:flex justify-center items-center gap-1 xl:gap-2 font-title">
            {navLinks.map((link) => {
              const active = link.isActive(pathname);
              if (isSignupForm) {
                return (
                  <span
                    key={link.name}
                    className="px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-[16px] tracking-wide whitespace-nowrap transition-all text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 font-semibold cursor-not-allowed select-none"
                    title="Complete sign up to access"
                  >
                    {link.name}
                  </span>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-[16px] tracking-wide whitespace-nowrap transition-all ${
                    active
                      ? "bg-orange text-white shadow-xs font-bold"
                      : "text-gray-700 dark:text-zinc-300 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 font-semibold"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right section: Notifications and Profile dropdown */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
            {/* Update the message icon section */}
            {isSignupForm ? (
              <span
                className="relative p-2 rounded-xl transition-all flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 font-semibold cursor-not-allowed select-none"
                title="Complete sign up to access"
              >
                <BiMessageRounded className="w-[26px] h-[26px]" />
              </span>
            ) : (
              <Link
                href="/vendor-dashboard/chats"
                className={`relative p-2 rounded-xl transition-all flex items-center justify-center ${
                  pathname.startsWith("/vendor-dashboard/chats")
                    ? "bg-orange text-white shadow-xs font-bold"
                    : "text-gray-700 dark:text-zinc-300 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 font-semibold"
                }`}
                title="Messages"
              >
                <BiMessageRounded className="w-[26px] h-[26px]" />
                {unreadCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-xs ${
                      pathname.startsWith("/vendor-dashboard/chats")
                        ? "bg-white text-orange"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification bell dropdown */}
            <div className="relative" ref={notificationMenuRef}>
              {isSignupForm ? (
                <span
                  className="relative p-2 rounded-xl transition-all flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 font-semibold cursor-not-allowed select-none"
                  title="Complete setup to access"
                >
                  <IoIosNotificationsOutline className="w-[28px] h-[28px]" />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNotificationMenu((prev) => !prev)}
                  className="relative p-2 rounded-xl hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-orange cursor-pointer"
                  title={pendingCount > 0 ? `${pendingCount} new notification${pendingCount === 1 ? "" : "s"}` : "Notifications"}
                  aria-label="Notifications"
                >
                  <IoIosNotificationsOutline className="w-[28px] h-[28px]" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-xs">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </button>
              )}

              {!isSignupForm && showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-darkSurface shadow-2xl rounded-2xl py-2 z-50 border border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-title font-bold text-base text-gray-900 dark:text-zinc-100">Notifications</span>
                      {pendingCount > 0 && (
                        <span className="bg-orange/10 text-orange text-xs font-bold px-2 py-0.5 rounded-full">
                          {pendingCount} new
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-800">
                    {pendingRequests.length === 0 ? (
                      <div className="py-10 px-4 text-center">
                        <IoIosNotificationsOutline className="w-12 h-12 text-gray-300 dark:text-zinc-600 mx-auto mb-2.5" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">No new notifications</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">You are all caught up!</p>
                      </div>
                    ) : (
                      pendingRequests.map((req: any) => {
                        const visitorName = formatCoupleName(req.visitor, "A couple");
                        return (
                          <Link
                            key={req.id}
                            href="/vendor-dashboard?tab=approvals"
                            onClick={() => setShowNotificationMenu(false)}
                            className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors block"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                                {visitorName.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
                                  {visitorName} requested a booking
                                </p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                  {req.package?.name || "Service Package"} • {req.bookingDate}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <FiSun className="hidden dark:block w-[24px] h-[24px] text-amber-400 hover:rotate-45 transition-transform" />
              <FiMoon className="block dark:hidden w-[24px] h-[24px] text-gray-700 dark:text-zinc-300 hover:text-orange transition-transform" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={handleProfileClick}
                className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-orange/40 transition-all cursor-pointer"
                aria-label="Vendor profile menu"
              >
                <Image
                  src={profilePic}
                  alt="vendor-profile-image"
                  className={`w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-full object-cover transition-all border-2 ${
                    showProfileMenu
                      ? "border-orange ring-2 ring-orange/30 shadow-sm"
                      : "border-orange/25 dark:border-orange/40 hover:border-orange shadow-xs"
                  }`}
                  width={50}
                  height={50}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-darkSurface rounded-2xl shadow-xl border border-orange/20 dark:border-orange/30 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Vendor info header */}
                  <div className="px-4 py-2.5 border-b border-orange/15 dark:border-orange/20">
                    <p className="font-title text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                      {data?.findVendorById?.busname ||
                        `${data?.findVendorById?.fname || ""} ${data?.findVendorById?.lname || ""}`.trim() ||
                        "Vendor Partner"}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-1">
                    {isSignupForm ? (
                      <div
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 dark:text-zinc-500 opacity-60 cursor-not-allowed select-none"
                        title="Complete setup to access settings"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 flex items-center justify-center flex-shrink-0">
                          <FiSettings size={15} />
                        </div>
                        <span className="font-title text-sm font-semibold text-gray-400 dark:text-zinc-500">
                          Settings
                        </span>
                      </div>
                    ) : (
                      <Link
                        href="/vendor-dashboard/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-orange hover:bg-orange/5 dark:hover:bg-orange/15 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange/10 dark:bg-orange/20 border border-orange/20 text-orange flex items-center justify-center transition-colors group-hover:bg-orange group-hover:text-white flex-shrink-0">
                          <FiSettings size={15} />
                        </div>
                        <span className="font-title text-sm font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors">
                          Settings
                        </span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/40 transition-all group text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200/60 dark:border-red-900/40 text-red-500 flex items-center justify-center transition-colors group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 flex-shrink-0">
                        <FiLogOut size={15} />
                      </div>
                      <span className="font-title text-sm font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width Auto-Height Mobile Dropdown Menu (Directly attached below header) */}
        {isMobileMenuOpen && (
          <div
            id="vendor-mobile-dropdown"
            className="lg:hidden absolute top-full left-0 right-0 w-full z-50 bg-lightYellow dark:bg-darkBg border-b-2 border-orange/30 dark:border-orange/40 shadow-2xl transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
              {/* Navigation Links Grid (2 columns on tablet/wide mobile, 1 on small screens) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-title">
                {navLinks.map((link) => {
                  const active = link.isActive(pathname);
                  const Icon = link.icon;
                  if (isSignupForm) {
                    return (
                      <span
                        key={link.name}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm sm:text-base tracking-wide bg-white/70 dark:bg-darkElevated/70 text-gray-400 dark:text-zinc-500 border border-orange/15 dark:border-zinc-800 font-semibold cursor-not-allowed select-none"
                      >
                        <Icon
                          size={18}
                          className="text-gray-400 dark:text-zinc-500"
                        />
                        <span>{link.name}</span>
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm sm:text-base tracking-wide transition-all ${
                        active
                          ? "bg-orange text-white shadow-xs font-bold border border-orange"
                          : "bg-white/90 dark:bg-darkElevated/70 text-gray-800 dark:text-zinc-200 border border-orange/15 dark:border-zinc-800 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 font-semibold"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          active
                            ? "text-white"
                            : "text-orange dark:text-orange/80"
                        }
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Account / Quick Actions Section */}
              <div className="pt-3 border-t border-orange/15 dark:border-zinc-800 space-y-2 font-title">
                <div className="grid grid-cols-2 gap-2.5">
                  {isSignupForm ? (
                    <span className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-orange/15 dark:border-zinc-800 text-sm font-semibold text-gray-400 dark:text-zinc-500 bg-white/70 dark:bg-darkElevated cursor-not-allowed select-none">
                      <FiSettings size={16} />
                      <span>Settings</span>
                    </span>
                  ) : (
                    <Link
                      href="/vendor-dashboard/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-orange/30 dark:border-zinc-700 text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white/90 dark:bg-darkElevated hover:bg-orange/5 dark:hover:bg-zinc-800 hover:border-orange transition-all shadow-2xs text-center"
                    >
                      <FiSettings size={16} className="text-orange" />
                      <span>Settings</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all cursor-pointer text-center"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Dimmed Backdrop ONLY below the header so the header remains 100% visible and bright */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-black/45 backdrop-blur-2xs transition-opacity duration-200"
          style={{ top: `${headerHeight}px` }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </Fragment>
  );
};

export default VendorHeader;
