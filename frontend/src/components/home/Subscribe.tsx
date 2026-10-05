import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const Subscribe = () => {
  return (
    <div className="h-auto py-6 sm:py-12 md:py-16 w-full bg-brown dark:bg-[#1A1615] border-y border-orange/15 dark:border-zinc-800/80 flex justify-center items-center transition-colors duration-200">
      <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-screen-lg px-4 sm:px-6 gap-4 sm:gap-6 lg:gap-8">
        <div className="text-center lg:text-left">
          <span className="inline-block text-orange text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-1 sm:mb-2 bg-orange/15 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
            For Wedding Vendors & Service Providers
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-title text-white leading-tight mt-0.5 sm:mt-1">
            Grow your wedding business with Say I Do
          </h2>
          <p className="text-xs sm:text-base text-zinc-300 dark:text-zinc-400 mt-1 sm:mt-2 max-w-xl">
            Showcase your packages, receive verified couple inquiries, and manage bookings effortlessly across Sri Lanka.
          </p>
        </div>
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <Link
            href="/vendor-signup"
            className="flex-1 sm:flex-initial sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-orange hover:bg-orange/90 active:scale-[0.98] text-white font-title text-xs sm:text-lg font-semibold shadow-md transition-all text-center"
          >
            <span>Join as a Vendor</span>
            <FiArrowRight size={14} className="shrink-0" />
          </Link>
          <Link
            href="/vendor-login"
            className="flex-1 sm:flex-initial sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-white/25 hover:border-white text-white hover:bg-white/10 font-title text-xs sm:text-base font-medium transition-all text-center"
          >
            Vendor Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
