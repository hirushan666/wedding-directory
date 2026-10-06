"use client";

import React from "react";

interface PayHereBannerProps {
  /** 'auto' shows Long on desktop/tablet and Short on mobile */
  variant?: "auto" | "long" | "short" | "square";
  className?: string;
}

export const PayHereBanner: React.FC<PayHereBannerProps> = ({
  variant = "auto",
  className = "",
}) => {
  return (
    <a
      href="https://www.payhere.lk"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center transition-opacity hover:opacity-90 ${className}`}
      aria-label="Payments secured by PayHere"
    >
      {/* 1. AUTO MODE: Long on desktop/tablet (sm+), Short on mobile (<sm) */}
      {variant === "auto" && (
        <>
          {/* Mobile view (< sm): Short Banner 250px */}
          <div className="block sm:hidden">
            {/* Light Mode */}
            <img
              src="https://www.payhere.lk/downloads/images/payhere_short_banner.png"
              alt="PayHere Payment Methods"
              width={250}
              height={45}
              className="h-auto max-w-[240px] dark:hidden"
              loading="lazy"
            />
            {/* Dark Mode */}
            <img
              src="https://www.payhere.lk/downloads/images/payhere_short_banner_dark.png"
              alt="PayHere Payment Methods"
              width={250}
              height={45}
              className="h-auto max-w-[240px] hidden dark:block"
              loading="lazy"
            />
          </div>

          {/* Desktop & Tablet view (>= sm): Long Banner 400px */}
          <div className="hidden sm:block">
            {/* Light Mode */}
            <img
              src="https://www.payhere.lk/downloads/images/payhere_long_banner.png"
              alt="PayHere Payment Methods"
              width={380}
              height={40}
              className="h-auto max-w-[380px] dark:hidden"
              loading="lazy"
            />
            {/* Dark Mode */}
            <img
              src="https://www.payhere.lk/downloads/images/payhere_long_banner_dark.png"
              alt="PayHere Payment Methods"
              width={380}
              height={40}
              className="h-auto max-w-[380px] hidden dark:block"
              loading="lazy"
            />
          </div>
        </>
      )}

      {/* 2. FORCED SHORT BANNER (250px) */}
      {variant === "short" && (
        <>
          <img
            src="https://www.payhere.lk/downloads/images/payhere_short_banner.png"
            alt="PayHere Payment Methods"
            width={240}
            height={45}
            className="h-auto max-w-full dark:hidden"
            loading="lazy"
          />
          <img
            src="https://www.payhere.lk/downloads/images/payhere_short_banner_dark.png"
            alt="PayHere Payment Methods"
            width={240}
            height={45}
            className="h-auto max-w-full hidden dark:block"
            loading="lazy"
          />
        </>
      )}

      {/* 3. FORCED LONG BANNER (400px) */}
      {variant === "long" && (
        <>
          <img
            src="https://www.payhere.lk/downloads/images/payhere_long_banner.png"
            alt="PayHere Payment Methods"
            width={380}
            height={40}
            className="h-auto max-w-full dark:hidden"
            loading="lazy"
          />
          <img
            src="https://www.payhere.lk/downloads/images/payhere_long_banner_dark.png"
            alt="PayHere Payment Methods"
            width={380}
            height={40}
            className="h-auto max-w-full hidden dark:block"
            loading="lazy"
          />
        </>
      )}

      {/* 4. FORCED SQUARE BANNER (150px) */}
      {variant === "square" && (
        <>
          <img
            src="https://www.payhere.lk/downloads/images/payhere_square_banner.png"
            alt="PayHere Payment Methods"
            width={150}
            height={60}
            className="h-auto max-w-full dark:hidden"
            loading="lazy"
          />
          <img
            src="https://www.payhere.lk/downloads/images/payhere_square_banner_dark.png"
            alt="PayHere Payment Methods"
            width={150}
            height={60}
            className="h-auto max-w-full hidden dark:block"
            loading="lazy"
          />
        </>
      )}
    </a>
  );
};

export default PayHereBanner;
