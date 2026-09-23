"use client";

import React from "react";
import Link from "next/link";
import { FaFacebook, FaPinterest } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { useAuth as useVisitorAuth } from "@/contexts/VisitorAuthContext";
import { useVendorAuth } from "@/contexts/VendorAuthContext";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { visitor } = useVisitorAuth();
  const { vendor } = useVendorAuth();
  const isLoggedIn = !!visitor || !!vendor;

  const homeHref = visitor
    ? "/visitor-dashboard"
    : vendor
      ? "/vendor-dashboard"
      : "/";

  return (
    <footer className="w-full border-t border-orange/15 dark:border-zinc-800/80 bg-lightYellow dark:bg-darkBg font-body mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          {/* Brand & Brief Tagline */}
          <div className="lg:col-span-4">
            {isLoggedIn ? (
              <div className="inline-block mb-3 select-none cursor-default">
                <span className="font-title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                  Say I Do
                </span>
              </div>
            ) : (
              <Link href="/" className="inline-block mb-3">
                <span className="font-title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                  Say I Do
                </span>
              </Link>
            )}
            <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed max-w-sm mb-4">
              Sri Lanka&apos;s premier wedding directory and planning companion,
              connecting couples with verified vendors to craft unforgettable
              celebrations.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-orange font-medium bg-orange/10 border border-orange/20 px-3 py-1 rounded-full">
              <FiHeart size={12} />
              <span>Made with love for weddings</span>
            </div>
          </div>

          {/* Explore / Navigation */}
          <div className="lg:col-span-2">
            <h4 className="font-title text-base font-bold text-gray-900 dark:text-zinc-100 mb-3 tracking-wide">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
              <li>
                <Link
                  href={homeHref}
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Find Services
                </Link>
              </li>
              <li>
                <Link
                  href="/visitor-dashboard"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Planning Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Wedding Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Help & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="lg:col-span-2">
            <h4 className="font-title text-base font-bold text-gray-900 dark:text-zinc-100 mb-3 tracking-wide">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-use"
                  className="hover:text-orange dark:hover:text-orange transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendor Partnership Card */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 dark:bg-darkSurface/90 backdrop-blur-xs rounded-2xl border border-orange/20 dark:border-zinc-800 p-5 sm:p-6 shadow-2xs">
              <span className="text-[11px] font-semibold text-orange uppercase tracking-wider block mb-1">
                For Service Providers
              </span>
              <h4 className="font-title text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1.5">
                Grow your wedding business
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">
                Showcase your packages, receive verified couple inquiries, and
                manage bookings effortlessly.
              </p>
              <Link
                href="/vendor-signup"
                className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <span>Join as a Vendor</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="border-t border-orange/10 dark:border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-zinc-500 text-center sm:text-left">
            &copy; {currentYear} Say I Do. All rights reserved.
          </p>

          <div className="flex items-center gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-white dark:hover:text-white hover:bg-orange dark:hover:bg-orange hover:border-orange dark:hover:border-orange flex items-center justify-center transition-all shadow-2xs"
              aria-label="Facebook"
            >
              <FaFacebook size={14} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-white dark:hover:text-white hover:bg-orange dark:hover:bg-orange hover:border-orange dark:hover:border-orange flex items-center justify-center transition-all shadow-2xs"
              aria-label="Twitter / X"
            >
              <FaXTwitter size={13} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-white dark:hover:text-white hover:bg-orange dark:hover:bg-orange hover:border-orange dark:hover:border-orange flex items-center justify-center transition-all shadow-2xs"
              aria-label="Instagram"
            >
              <AiFillInstagram size={15} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-white dark:hover:text-white hover:bg-orange dark:hover:bg-orange hover:border-orange dark:hover:border-orange flex items-center justify-center transition-all shadow-2xs"
              aria-label="Pinterest"
            >
              <FaPinterest size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
