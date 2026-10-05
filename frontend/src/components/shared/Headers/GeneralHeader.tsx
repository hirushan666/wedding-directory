"use client";

import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import {
  FiSun,
  FiMoon,
  FiHome,
  FiGrid,
  FiBookOpen,
  FiInfo,
  FiMail,
  FiHelpCircle,
  FiArrowRight,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import Nav from "../Nav";

interface NavLinkItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const navLinks: NavLinkItem[] = [
  { name: "Home", path: "/", icon: FiHome },
  { name: "Services", path: "/services", icon: FiGrid },
  { name: "Blog", path: "/blog", icon: FiBookOpen },
  { name: "About", path: "/about", icon: FiInfo },
  { name: "Contact", path: "/contact", icon: FiMail },
  { name: "Help", path: "/help", icon: FiHelpCircle },
];

const GeneralHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Close the mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll and handle Escape key when the mobile menu is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <Fragment>
      <header className="sticky top-0 z-40 py-3 sm:py-3.5 xl:py-4 text-black dark:text-zinc-100 bg-lightYellow/95 dark:bg-darkBg/95 backdrop-blur-md border-b border-orange/15 dark:border-orange/20 transition-all duration-200 shadow-2xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 w-full gap-3 sm:gap-4">
          {/* Logo Column */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 font-title whitespace-nowrap group-hover:text-orange transition-colors">
                Say I Do
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation Column */}
          <div className="hidden xl:flex justify-center items-center flex-1">
            <Nav />
          </div>

          {/* Actions Column: Theme toggle & Auth buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-gray-700 dark:text-zinc-300 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <FiSun className="hidden dark:block w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              <FiMoon className="block dark:hidden w-5 h-5 text-gray-700 hover:text-orange transition-transform" />
            </button>

            {/* Quick login link for small tablets / mobile */}
            <Link
              href="/visitor-login"
              className="hidden sm:inline-flex xl:hidden px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 font-title text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkSurface hover:bg-gray-50 dark:hover:bg-darkElevated hover:border-orange transition-all shadow-2xs"
            >
              Login
            </Link>

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

            {/* Mobile Menu Button - Visible below xl */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="xl:hidden p-2 rounded-xl text-gray-800 dark:text-zinc-100 hover:bg-orange/10 dark:hover:bg-zinc-800 hover:text-orange transition-colors cursor-pointer"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="public-mobile-nav"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <HiMenu className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Rendered as a sibling outside <header> so backdrop-blur does not trap fixed positioning) */}
      <div
        className={`xl:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        id="public-mobile-nav"
      >
        {/* Backdrop Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Drawer */}
        <div
          className={`absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-white dark:bg-darkSurface border-l border-orange/15 dark:border-zinc-800 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out z-10 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Top Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-orange/15 dark:border-zinc-800">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-title font-bold text-2xl text-gray-900 dark:text-zinc-100 hover:text-orange transition-colors"
            >
              Say I Do
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-orange/10 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 font-title">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.path);

              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base tracking-wide transition-all ${
                    isActive
                      ? "bg-orange text-white shadow-xs font-bold"
                      : "text-gray-700 dark:text-zinc-200 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 font-medium"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-400 dark:text-zinc-400"
                    }
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Auth Section */}
          <div className="p-5 sm:p-6 border-t border-orange/15 dark:border-zinc-800 space-y-3 bg-gray-50/50 dark:bg-darkElevated/50 font-title">
            <Link
              href="/visitor-login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 text-base font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkSurface hover:bg-gray-50 dark:hover:bg-darkElevated hover:border-orange transition-all shadow-2xs"
            >
              <FiLogIn size={18} className="text-gray-500 dark:text-zinc-400" />
              <span>Login</span>
            </Link>

            <Link
              href="/visitor-signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-base font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.98] transition-all shadow-xs"
            >
              <FiUserPlus size={18} />
              <span>Get Started</span>
            </Link>

            {/* Vendor Partner Callout */}
            <div className="pt-2 text-center">
              <Link
                href="/vendor-login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-orange dark:hover:text-orange transition-colors"
              >
                <span>Are you a wedding vendor? Partner with us</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default GeneralHeader;
