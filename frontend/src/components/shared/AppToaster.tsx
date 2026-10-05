"use client";

import React, { useEffect, useState } from "react";
import { Toaster as HotToaster } from "react-hot-toast";

/**
 * Mobile-responsive and theme-aware Toaster wrapper.
 * - On Mobile (< 640px): Positioned at "bottom-center" (snackbar style) with safe margin,
 *   so it doesn't block the header, logo, or navigation bar.
 * - On Desktop (>= 640px): Positioned at "top-center" with generous spacing.
 * - Styled with smooth modern pill design, app typography, borders, and dark mode support.
 */
export default function AppToaster() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <HotToaster
      position={isMobile ? "bottom-center" : "top-center"}
      reverseOrder={false}
      gutter={10}
      containerStyle={
        isMobile
          ? {
              bottom: 24,
              left: 16,
              right: 16,
            }
          : {
              top: 76,
            }
      }
      toastOptions={{
        duration: 4000,
        className:
          "!font-sans !font-medium !text-sm !shadow-xl !rounded-2xl !py-3 !px-4 !max-w-[92vw] sm:!max-w-md !border transition-all",
        style: {
          backgroundColor: "var(--toast-bg, #ffffff)",
          color: "var(--toast-color, #1f2937)",
          borderColor: "var(--toast-border, rgba(0, 0, 0, 0.08))",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        success: {
          iconTheme: {
            primary: "#10B981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
