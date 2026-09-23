"use client";

import React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiHome, FiDollarSign, FiUsers, FiChevronLeft, FiChevronRight, FiClock, FiBookmark } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsChatDots } from "react-icons/bs";
import { Sparkles } from "lucide-react";

interface LeftSideBarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  visitorId: string | null;
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({ isCollapsed, onToggleCollapse, visitorId }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/visitor-dashboard",
      icon: <FiHome className="w-5 h-5" />,
      label: "Dashboard"
    },
    {
      href: `/visitor-dashboard/checklist/${visitorId}`,
      icon: <IoMdCheckmarkCircleOutline className="w-5 h-5" />,
      label: "Checklist"
    },
    {
      href: `/visitor-dashboard/budgeter/${visitorId}`,
      icon: <FiDollarSign className="w-5 h-5" />,
      label: "Budgeter"
    },
    {
      href: "/guest-list",
      icon: <FiUsers className="w-5 h-5" />,
      label: "Guest List"
    },
    {
      href: `/visitor-dashboard/my-vendors/${visitorId}`,
      icon: <FiBookmark className="w-5 h-5" />,
      label: "Saved Services"
    },
    {
      href: `/visitor-dashboard/chats/${visitorId}`,
      icon: <BsChatDots className="w-5 h-5" />,
      label: "Chats"
    },
    {
      href: '/visitor-dashboard/recommendations',
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Smart Picks'
    },
    {
      href: "/visitor-dashboard/payments-history",
      icon: <FiClock className="w-5 h-5" />,
      label: "Payments History"
    }
  ];

  return (
    <div className="relative">
      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 bg-white dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 rounded-full p-1.5 shadow-md hover:bg-orange/10 hover:text-orange transition-all duration-200 ease-in-out z-10"
      >
        {isCollapsed ? (
          <FiChevronRight className="w-4 h-4" />
        ) : (
          <FiChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Sidebar container */}
      <div
        className={`
          bg-white dark:bg-darkSurface font-title rounded-2xl border border-orange/20 dark:border-zinc-800 shadow-sm transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-full'}
        `}
      >
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.label === "Chats" && pathname.startsWith("/visitor-dashboard/chats")) ||
              (item.label === "Smart Picks" && pathname.startsWith("/visitor-dashboard/recommendations"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 rounded-xl
                  transition-colors duration-200 ease-in-out font-body text-sm
                  ${isActive
                  ? "bg-orange text-white shadow-xs font-semibold"
                  : "text-gray-700 dark:text-zinc-300 hover:bg-orange/5 dark:hover:bg-darkElevated hover:text-orange dark:hover:text-orange"
                }
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  group
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={`
                  flex-shrink-0
                  ${isActive ? "text-white" : "text-gray-500 dark:text-zinc-400 group-hover:text-orange"}
                  ${isCollapsed ? 'mr-0' : 'mr-3'}
                  transition-all duration-200
                `}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="text-sm font-medium transition-all duration-200">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-gray-900 dark:bg-zinc-800 text-white text-xs rounded-lg shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 border border-zinc-700 font-body">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default LeftSideBar;