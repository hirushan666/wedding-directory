"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-20 sm:bottom-6 right-5 sm:right-6 z-40 p-3 rounded-full bg-orange text-white shadow-lg shadow-orange/30 dark:shadow-black/50 hover:bg-orange-600 hover:shadow-orange/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer ${
        isVisible
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-75 pointer-events-none"
      }`}
    >
      <ChevronUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
};

export default ScrollToTop;
