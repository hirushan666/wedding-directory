import React from "react";

const AboutUsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm border border-orange/15 dark:border-zinc-800 p-4 sm:p-8 md:p-10 transition-colors">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-orange/10 text-orange border border-orange/20 mb-2 sm:mb-3">
        About Us
      </div>
      <h2 className="font-title font-bold text-lg sm:text-3xl md:text-4xl text-gray-900 dark:text-zinc-100 mb-2 sm:mb-4 tracking-tight">
        Your Wedding Journey Starts Here
      </h2>
      <p className="text-gray-600 dark:text-zinc-300 font-body text-xs sm:text-base leading-relaxed">
        Sayido.lk celebrates Sri Lankan weddings by connecting couples with the country&apos;s finest verified vendors, venues, and wedding services. From intimate ceremonies to grand celebrations, we provide personalized tools and trusted professionals to bring your dream celebration to life with ease.
      </p>

      {/* Mobile-Friendly Feature Highlights */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-6 mt-3 sm:mt-6 border-t border-gray-100 dark:border-zinc-800/80">
        <div className="text-center p-1.5 sm:p-3 rounded-xl bg-orange/5 dark:bg-orange/10 border border-orange/15 dark:border-orange/20">
          <p className="font-title font-bold text-xs sm:text-xl text-orange">100%</p>
          <p className="text-[9px] sm:text-xs text-gray-500 dark:text-zinc-400 font-body">Sri Lankan Focus</p>
        </div>
        <div className="text-center p-1.5 sm:p-3 rounded-xl bg-orange/5 dark:bg-orange/10 border border-orange/15 dark:border-orange/20">
          <p className="font-title font-bold text-xs sm:text-xl text-orange">Verified</p>
          <p className="text-[9px] sm:text-xs text-gray-500 dark:text-zinc-400 font-body">Top Vendors</p>
        </div>
        <div className="text-center p-1.5 sm:p-3 rounded-xl bg-orange/5 dark:bg-orange/10 border border-orange/15 dark:border-orange/20">
          <p className="font-title font-bold text-xs sm:text-xl text-orange">Seamless</p>
          <p className="text-[9px] sm:text-xs text-gray-500 dark:text-zinc-400 font-body">Planning Tools</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSection;
