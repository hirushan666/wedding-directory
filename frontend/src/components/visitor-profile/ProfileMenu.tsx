"use client";

import React from "react";
import { FiHeart, FiLock, FiSettings } from "react-icons/fi";

interface ProfileMenuProps {
  setActiveSection: (section: string) => void;
  activeSection?: string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  setActiveSection,
  activeSection = "weddingDetails",
}) => {
  const menuItems = [
    {
      id: "weddingDetails",
      label: "Wedding Details",
      description: "Couple names, dates & venue",
      icon: FiHeart,
    },
    {
      id: "accountDetails",
      label: "Account Details",
      description: "Email & security password",
      icon: FiLock,
    },
  ];

  return (
    <>
      {/* ── Mobile: horizontal tab strip (hidden on lg+) ── */}
      <div className="lg:hidden bg-white dark:bg-darkSurface shadow-sm border border-orange/20 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-orange/15">
          <div className="w-6 h-6 rounded-md bg-orange/10 flex items-center justify-center text-orange shrink-0">
            <FiSettings className="text-sm" />
          </div>
          <span className="font-title font-bold text-base text-gray-900 dark:text-zinc-100">
            Settings
          </span>
        </div>
        <nav className="flex overflow-x-auto scrollbar-none font-body">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-5 py-3 whitespace-nowrap text-sm font-semibold border-b-2 transition-all duration-150 flex-1 justify-center ${
                  isActive
                    ? "border-orange text-orange bg-orange/5 dark:bg-orange/10"
                    : "border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="text-base flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Desktop: vertical sidebar (hidden below lg) ── */}
      <div className="hidden lg:block bg-white dark:bg-darkSurface shadow-sm border border-orange/20 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-orange/15">
          <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange shrink-0">
            <FiSettings className="text-lg" />
          </div>
          <div>
            <h2 className="font-title font-bold text-xl text-gray-900 dark:text-zinc-100 leading-tight">
              Settings
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-body">
              Preferences & account
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5 font-body">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? "bg-orange text-white shadow-md shadow-orange/20 font-medium"
                    : "text-gray-600 dark:text-zinc-300 hover:bg-orange/5 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-orange"
                }`}
              >
                <Icon
                  className={`text-lg flex-shrink-0 ${
                    isActive ? "text-white" : "text-gray-400 dark:text-zinc-400"
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold leading-snug">
                    {item.label}
                  </span>
                  <span
                    className={`text-xs ${
                      isActive
                        ? "text-white/80"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default ProfileMenu;