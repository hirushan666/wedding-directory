"use client";

import Link from "next/link";
import { Button } from "../../ui/button";
import { Fragment, useState } from "react";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import Nav from "../Nav";

const GeneralHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <Fragment>
      <header className="sticky top-0 z-30 py-3.5 xl:py-4 text-black dark:text-zinc-100 bg-lightYellow/95 dark:bg-darkBg/95 backdrop-blur-md border-b border-orange/15 dark:border-orange/20 transition-all duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 w-full gap-4">
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="xl:hidden flex justify-start items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black dark:text-zinc-100 p-1.5 rounded-lg hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="text-3xl" size={28} />
              ) : (
                <HiMenu className="text-3xl" size={28} />
              )}
            </button>
          </div>

          {/* Logo Column */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-zinc-100 font-title whitespace-nowrap">
                Say I Do
              </h1>
            </Link>
          </div>

          {/* Navigation Column */}
          <div className="hidden xl:flex justify-center items-center flex-1">
            <Nav />
          </div>

          {/* Actions Column: Theme toggle & Auth buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-700 dark:text-zinc-300 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <FiSun className="hidden dark:block w-[22px] h-[22px] text-amber-400 hover:rotate-45 transition-transform" />
              <FiMoon className="block dark:hidden w-[22px] h-[22px] text-gray-700 dark:text-zinc-300 hover:text-orange transition-transform" />
            </button>

            {/* Desktop Auth Buttons */}
            <div className="hidden xl:flex items-center gap-2.5">
              <Link
                href="/visitor-login"
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 font-title text-base font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkSurface hover:bg-gray-50 dark:hover:bg-darkElevated hover:border-gray-400 dark:hover:border-zinc-500 transition-all shadow-2xs"
              >
                Login
              </Link>
              <Link
                href="/visitor-signup"
                className="px-4 py-2 rounded-xl font-title text-base font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.98] transition-all shadow-xs"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Always rendered) */}
        <div className={`${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black z-40 transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'opacity-40' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Slide-in Menu */}
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white dark:bg-darkSurface border-r border-gray-100 dark:border-zinc-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col justify-between"
            style={{
              transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="p-6 space-y-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <span className="font-title font-bold text-xl text-gray-900 dark:text-zinc-100">
                  Say I Do
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <HiX size={24} />
                </button>
              </div>

              {/* Navigation Links */}
              {[
                { name: "home", path: "/" },
                { name: "blog", path: "/blog" },
                { name: "services", path: "/services" },
                { name: "about", path: "/about" },
                { name: "contact", path: "/contact" },
                { name: "help", path: "/help" },
              ].map((link, index) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    href={link.path}
                    key={index}
                    className={`text-base font-title capitalize transition-all cursor-pointer py-1.5 px-2 rounded-lg ${
                      isActive
                        ? "font-bold text-orange bg-orange/10 dark:bg-orange/15"
                        : "text-gray-800 dark:text-zinc-200 hover:text-orange dark:hover:text-orange hover:bg-orange/5"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Authentication Buttons */}
              <div className="pt-4 space-y-2.5 border-t border-gray-100 dark:border-zinc-800">
                <Link
                  href="/visitor-login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-2.5 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 font-title text-base font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkElevated hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                >
                  Login
                </Link>
                <Link
                  href="/visitor-signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-2.5 px-4 rounded-xl font-title text-base font-semibold text-white bg-orange hover:bg-orange/90 transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

export default GeneralHeader;
