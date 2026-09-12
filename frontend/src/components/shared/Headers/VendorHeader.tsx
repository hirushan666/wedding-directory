"use client";
import React, { Fragment, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoIosNotificationsOutline } from "react-icons/io";
import { BiMessageRounded } from "react-icons/bi";
import { FiCalendar } from "react-icons/fi";
import Image from "next/image";
import { useVendorAuth } from "@/contexts/VendorAuthContext"; // Added vendor auth context
import { useChatSocket } from "@/hooks/useChatSocket";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID, GET_VENDOR_APPROVAL_REQUESTS } from "@/graphql/queries";
import toast from "react-hot-toast";
import { formatCoupleName } from "@/utils/formatCoupleName";

const VendorHeader = () => {
  const router = useRouter();
  const { logout, vendor } = useVendorAuth(); // Added logout function from vendor auth context
  const [showProfileMenu, setShowProfileMenu] = useState(false); // State for the profile dropdown
  const [showNotificationMenu, setShowNotificationMenu] = useState(false); // State for notifications dropdown
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef<number | null>(null);

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
    skip: !vendor?.id,
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
      <header className="py-6 xl:py-6 text-black bg-white">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left section: Logo */}
          <div className="flex items-start justify-start flex-1">
            <Link href="/">
              <h1 className="text-2xl font-bold text-text font-title">
                Say I Do
              </h1>
              <p className="text-sm font-title text-center">Vendors</p>
            </Link>
          </div>

          {/* Center section: Navigation */}
          <div className="flex-1 flex justify-center items-center gap-8 text-xl font-title text-text">
            <Link href="/vendor-dashboard">Dashboard</Link>
            <Link href="/vendor-dashboard/analytics">Analytics</Link>
            <Link href="/vendor-dashboard/payments">Payments</Link>
            <Link href="/vendor-search">Vendors</Link>
            <Link href="/vendor-dashboard/settings">Settings</Link>
            <Link href="/help">Help</Link>
          </div>

          {/* Right section: Notifications and Profile dropdown */}
          <div className="flex items-center justify-end gap-8 flex-1">
            {/* Update the message icon section */}
            <Link href="/vendor-dashboard/chats" className="relative">
              <BiMessageRounded className="w-[33px] h-[33px] cursor-pointer hover:text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Notification bell dropdown */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                type="button"
                onClick={() => setShowNotificationMenu((prev) => !prev)}
                className="relative p-1 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-text"
                title={pendingCount > 0 ? `${pendingCount} new notification${pendingCount === 1 ? "" : "s"}` : "Notifications"}
                aria-label="Notifications"
              >
                <IoIosNotificationsOutline className="w-[36px] h-[36px] cursor-pointer hover:text-gray-600" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-sm">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white shadow-2xl rounded-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-title font-bold text-base text-gray-900">Notifications</span>
                      {pendingCount > 0 && (
                        <span className="bg-orange/10 text-orange text-xs font-bold px-2 py-0.5 rounded-full">
                          {pendingCount} new
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {pendingRequests.length === 0 ? (
                      <div className="py-10 px-4 text-center">
                        <IoIosNotificationsOutline className="w-12 h-12 text-gray-300 mx-auto mb-2.5" />
                        <p className="text-sm font-semibold text-gray-700">No new notifications</p>
                        <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
                      </div>
                    ) : (
                      pendingRequests.map((req: any) => {
                        const visitorName = formatCoupleName(req.visitor, "A couple");
                        return (
                          <Link
                            key={req.id}
                            href="/vendor-dashboard?tab=approvals"
                            onClick={() => setShowNotificationMenu(false)}
                            className="block p-3.5 hover:bg-orange/5 transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-orange/10 text-orange flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                                {visitorName.charAt(0).toUpperCase() || "C"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {visitorName}
                                  </p>
                                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                    New Request
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Requested booking for <span className="font-semibold text-gray-800">{req.package?.name}</span>
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-400 font-medium">
                                  <FiCalendar size={12} className="text-orange" />
                                  <span>{req.bookingDate}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-orange font-semibold">Review request →</span>
                                </div>
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

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <Image
                src={profilePic}
                alt="vendor-profile-image"
                className="rounded-full cursor-pointer object-cover w-[50px] h-[50px]"
                width={50}
                height={50}
                onClick={handleProfileClick}
              />
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                  <Link href="/vendor-dashboard/settings">
                    <p className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-title text-lg">
                      Settings
                    </p>
                  </Link>
                  <p
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-title text-lg"
                    onClick={handleLogout}
                  >
                    Logout
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

export default VendorHeader;
