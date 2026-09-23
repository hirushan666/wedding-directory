import React from "react";
import { HomeIcon, CheckIcon, DollarSignIcon, UsersIcon, StoreIcon } from "lucide-react"; // Replace with actual icons

const BottomNavigationBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-darkSurface border-t border-gray-200 dark:border-zinc-800 shadow-md w-full z-50 overflow-hidden md:hidden">
      <ul className="flex justify-around py-2 max-w-screen-sm mx-auto">
        <li>
          <a href="/visitor-dashboard" className="flex flex-col items-center text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange transition-colors">
            <HomeIcon className="h-5 w-5 mb-0.5" />
            <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a href="/visitor-dashboard" className="flex flex-col items-center text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange transition-colors">
            <CheckIcon className="h-5 w-5 mb-0.5" />
            <span>Checklist</span>
          </a>
        </li>
        <li>
          <a href="/visitor-dashboard" className="flex flex-col items-center text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange transition-colors">
            <DollarSignIcon className="h-5 w-5 mb-0.5" />
            <span>Budgeter</span>
          </a>
        </li>
        <li>
          <a href="/guest-list" className="flex flex-col items-center text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange transition-colors">
            <UsersIcon className="h-5 w-5 mb-0.5" />
            <span>Guestlist</span>
          </a>
        </li>
        <li>
          <a href="/services" className="flex flex-col items-center text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange transition-colors">
            <StoreIcon className="h-5 w-5 mb-0.5" />
            <span>Services</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigationBar;
