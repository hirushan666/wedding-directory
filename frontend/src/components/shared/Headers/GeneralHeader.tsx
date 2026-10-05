"use client";

import Link from "next/link";
import { Fragment, useState, useEffect, useRef } from "react";
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
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(64);

  // Sync header height dynamically
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  // Close the mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <Fragment>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 py-3 sm:py-3.5 xl:py-4 text-gray-900 dark:text-zinc-100 bg-lightYellow/95 dark:bg-darkBg/95 backdrop-blur-md border-b border-orange/15 dark:border-orange/20 shadow-xs transition-all duration-200 relative"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 w-full gap-3 sm:gap-4">
          {/* Left Column: Mobile Hamburger Toggle + Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Mobile Toggle Button - High visibility styled button on the far left */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="xl:hidden p-2 sm:p-2.5 rounded-xl bg-orange/10 dark:bg-zinc-800 text-orange dark:text-orange border border-orange/25 dark:border-zinc-700 hover:bg-orange/20 dark:hover:bg-zinc-700/80 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="public-mobile-dropdown"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6 transition-transform duration-200" />
              ) : (
                <HiMenu className="w-6 h-6 transition-transform duration-200" />
              )}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="group flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 font-title tracking-tight whitespace-nowrap group-hover:text-orange transition-colors">
                Say I Do
              </h1>
            </Link>
          </div>

          {/* Center Column: Desktop Navigation */}
          <div className="hidden xl:flex justify-center items-center flex-1">
            <Nav />
          </div>

          {/* Right Column: Theme toggle & Desktop Auth Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-orange/10 dark:bg-zinc-800 text-gray-700 dark:text-amber-400 hover:text-orange hover:bg-orange/20 dark:hover:bg-zinc-700 border border-orange/20 dark:border-zinc-700 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <FiSun className="hidden dark:block w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              <FiMoon className="block dark:hidden w-5 h-5 text-gray-700 hover:text-orange transition-transform" />
            </button>

            {/* Quick Login button visible on tablets below xl */}
            <Link
              href="/visitor-login"
              className="hidden sm:inline-flex xl:hidden px-3.5 py-2 rounded-xl border border-orange/30 dark:border-zinc-700 font-title text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkSurface hover:bg-orange/5 dark:hover:bg-darkElevated hover:border-orange transition-all shadow-2xs"
            >
              Login
            </Link>

            {/* Desktop Auth Buttons */}
            <div className="hidden xl:flex items-center gap-2.5">
              <Link
                href="/visitor-login"
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 font-title text-base font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-darkSurface hover:bg-gray-50 dark:hover:bg-darkElevated hover:border-orange transition-all shadow-2xs"
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

        {/* Full-Width Auto-Height Mobile Dropdown Menu (Directly attached below header) */}
        {isMobileMenuOpen && (
          <div
            id="public-mobile-dropdown"
            className="xl:hidden absolute top-full left-0 right-0 w-full z-50 bg-lightYellow dark:bg-darkBg border-b-2 border-orange/30 dark:border-orange/40 shadow-2xl transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
              {/* Navigation Links Grid (2 columns on tablet/wide mobile, 1 on small screens) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-title">
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
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm sm:text-base tracking-wide transition-all ${
                        isActive
                          ? "bg-orange text-white shadow-xs font-bold border border-orange"
                          : "bg-white/90 dark:bg-darkElevated/70 text-gray-800 dark:text-zinc-200 border border-orange/15 dark:border-zinc-800 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 font-semibold"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? "text-white"
                            : "text-orange dark:text-orange/80"
                        }
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons Section */}
              <div className="pt-3 border-t border-orange/15 dark:border-zinc-800 space-y-2.5 font-title">
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/visitor-login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-orange/30 dark:border-zinc-700 text-sm font-semibold text-gray-800 dark:text-zinc-200 bg-white/90 dark:bg-darkElevated hover:bg-orange/5 dark:hover:bg-zinc-800 hover:border-orange transition-all shadow-2xs text-center"
                  >
                    <FiLogIn size={16} className="text-orange" />
                    <span>Login</span>
                  </Link>

                  <Link
                    href="/visitor-signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.98] transition-all shadow-xs text-center"
                  >
                    <FiUserPlus size={16} />
                    <span>Get Started</span>
                  </Link>
                </div>

                {/* Wedding Vendor Partner Callout */}
                <div className="text-center pt-1">
                  <Link
                    href="/vendor-login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:text-orange dark:hover:text-orange transition-colors"
                  >
                    <span>Are you a wedding vendor? Partner with us</span>
                    <FiArrowRight size={12} className="text-orange" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Dimmed Backdrop ONLY below the header so the header remains 100% visible and bright */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-x-0 bottom-0 z-40 bg-black/45 backdrop-blur-2xs transition-opacity duration-200"
          style={{ top: `${headerHeight}px` }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </Fragment>
  );
};

export default GeneralHeader;
