"use client";
import React, { useState } from "react";
import { FiHeart, FiTarget } from "react-icons/fi";

const PurposeAndVision: React.FC = () => {
  const [activeMobileTab, setActiveMobileTab] = useState<"purpose" | "mission">(
    "purpose"
  );

  return (
    <div className="w-full">
      {/* Mobile-Only Segmented Pill Switcher */}
      <div className="md:hidden flex p-1 mb-3 rounded-xl bg-orange/10 dark:bg-darkElevated border border-orange/15 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveMobileTab("purpose")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === "purpose"
              ? "bg-white dark:bg-darkSurface text-orange shadow-xs"
              : "text-gray-600 dark:text-zinc-400 hover:text-orange"
          }`}
        >
          <FiHeart className="text-xs" />
          <span>Our Purpose</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("mission")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === "mission"
              ? "bg-white dark:bg-darkSurface text-orange shadow-xs"
              : "text-gray-600 dark:text-zinc-400 hover:text-orange"
          }`}
        >
          <FiTarget className="text-xs" />
          <span>Our Mission</span>
        </button>
      </div>

      {/* Grid: 2 columns on desktop; on mobile only the active tab card is visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 md:gap-8 w-full items-stretch">
        {/* Our Purpose Card */}
        <div
          className={`bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/15 dark:border-zinc-800 p-4 sm:p-7 md:p-8 flex flex-col justify-between transition-all hover:border-orange/30 dark:hover:border-zinc-700 ${
            activeMobileTab === "purpose" ? "block" : "hidden md:flex"
          }`}
        >
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center mb-2.5 sm:mb-4">
              <FiHeart className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold font-title text-base sm:text-2xl text-gray-900 dark:text-zinc-100 mb-1.5 sm:mb-3 tracking-tight">
              Our Purpose
            </h3>
            <p className="text-gray-600 dark:text-zinc-300 text-xs sm:text-base leading-relaxed font-body">
              At Sayido.lk, our purpose is to bring people together, inspire love,
              and create memorable wedding experiences. We aim to simplify the
              wedding planning journey for couples across Sri Lanka, connecting them
              with the best vendors and venues in the country.
            </p>
          </div>
        </div>

        {/* Our Mission Card */}
        <div
          className={`bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/15 dark:border-zinc-800 p-4 sm:p-7 md:p-8 flex flex-col justify-between transition-all hover:border-orange/30 dark:hover:border-zinc-700 ${
            activeMobileTab === "mission" ? "block" : "hidden md:flex"
          }`}
        >
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center mb-2.5 sm:mb-4">
              <FiTarget className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold font-title text-base sm:text-2xl text-gray-900 dark:text-zinc-100 mb-1.5 sm:mb-3 tracking-tight">
              Our Mission
            </h3>
            <p className="text-gray-600 dark:text-zinc-300 text-xs sm:text-base leading-relaxed font-body">
              Our mission is to make wedding planning a stress-free and enjoyable
              experience for every couple. By leveraging innovative tools, expert
              guidance, and a curated network of professionals, we help couples plan
              the wedding of their dreams with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurposeAndVision;
