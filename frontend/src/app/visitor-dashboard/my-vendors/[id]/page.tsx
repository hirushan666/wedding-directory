'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useQuery } from '@apollo/client';
import { FIND_ALL_MY_VENDORS } from '@/graphql/queries';
import { useAuth } from '@/contexts/VisitorAuthContext';
import { CategoryCard, CategoryModal } from '@/components/visitor-dashboard/my-vendors/CategoryDropdown';
import categories from '@/utils/category.json';
import { FiSearch, FiBookmark, FiLayers } from 'react-icons/fi';

const MyVendors = () => {
  const { visitor } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading } = useQuery(FIND_ALL_MY_VENDORS, {
    variables: {
      visitorId: visitor?.id,
    },
    skip: !visitor,
  });

  // Get all vendors
  const allVendors = data?.findAllMyVendors || [];

  // Count of categories that have at least 1 saved vendor
  const categoriesWithVendorsCount = categories.filter((category) =>
    allVendors.some(
      (vendor: { service?: { category: string }; offering?: { category: string } }) =>
        (vendor.service || vendor.offering)?.category === category
    )
  ).length;

  // Filter categories based on saved status and search query
  const filteredCategories = categories.filter((category) => {
    // Filter mode
    if (filterMode === 'saved') {
      const hasOfferings = allVendors.some(
        (vendor: { service?: { category: string }; offering?: { category: string } }) =>
          (vendor.service || vendor.offering)?.category === category
      );
      if (!hasOfferings) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const categoryMatches = category.toLowerCase().includes(query);
      const vendorMatches = allVendors.some(
        (vendor: {
          service?: {
            category: string;
            name?: string;
            vendor?: { busname?: string; city?: string };
          };
          offering?: {
            category: string;
            name?: string;
            vendor?: { busname?: string; city?: string };
          };
        }) => {
          const svc = vendor.service || vendor.offering;
          return (
            svc?.category === category &&
            (svc?.name?.toLowerCase().includes(query) ||
              svc?.vendor?.busname?.toLowerCase().includes(query) ||
              svc?.vendor?.city?.toLowerCase().includes(query))
          );
        }
      );
      return categoryMatches || vendorMatches;
    }

    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Hero Header Card */}
      <div className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/15 dark:border-zinc-800 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange/5 dark:bg-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Dashboard", href: "/visitor-dashboard" },
                { label: "My Vendors" },
              ]}
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange/10 text-orange">
                  <FiBookmark size={13} />
                  Shortlisted & Booked
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                  {categories.length} Categories Total
                </span>
              </div>
              <h1 className="font-title text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                My Vendors
              </h1>
              <p className="font-body text-sm sm:text-base text-gray-600 dark:text-zinc-400 mt-1.5 max-w-2xl">
                Easily organize, track, and manage all your shortlisted and booked wedding vendors in one place.
              </p>

              {/* Metric badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="flex items-center gap-2 bg-orange/[0.06] dark:bg-darkElevated border border-orange/15 dark:border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-orange" />
                  <span>
                    <strong className="text-orange font-bold">{allVendors.length}</strong> Saved Vendors
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-orange/[0.06] dark:bg-darkElevated border border-orange/15 dark:border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  <FiLayers className="text-orange" size={14} />
                  <span>
                    <strong className="text-orange font-bold">{categoriesWithVendorsCount}</strong> Categories with Vendors
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange hover:bg-orange/90 text-white font-semibold text-sm shadow-xs transition-all w-full sm:w-auto"
              >
                <FiSearch size={16} />
                <span>Explore Services</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Vendors by Category Card */}
      <div className="bg-white dark:bg-darkSurface rounded-2xl border border-orange/15 dark:border-zinc-800 shadow-sm p-5 sm:p-7">
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-orange/10 dark:border-zinc-800">
          <div>
            <h2 className="font-title text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Vendors by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
              Click any category box below to open your shortlisted vendors or explore options.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Pills */}
            <div className="inline-flex items-center bg-orange/[0.06] dark:bg-darkElevated p-1 rounded-xl border border-orange/15 dark:border-zinc-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === "all"
                    ? "bg-orange text-white shadow-2xs"
                    : "text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange"
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("saved")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === "saved"
                    ? "bg-orange text-white shadow-2xs"
                    : "text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange"
                }`}
              >
                Saved Only ({categoriesWithVendorsCount})
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-4 pb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, vendor name, or city..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-orange/[0.02] dark:bg-darkElevated border border-orange/20 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-orange cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Boxes Grid */}
        <div className="w-full">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-orange/25 dark:border-zinc-800 bg-orange/[0.015] dark:bg-darkElevated/30">
              <div className="w-12 h-12 rounded-full bg-orange/10 text-orange flex items-center justify-center mx-auto mb-3">
                <FiSearch size={20} />
              </div>
              <h3 className="font-title text-base sm:text-lg font-bold text-gray-800 dark:text-zinc-200">
                No matching categories found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No categories match "${searchQuery}". Try a different search term or clear the filter.`
                  : "You haven't saved any vendors in any category yet."}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-white dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 hover:border-orange/30 hover:text-orange transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
                {filterMode === "saved" && (
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange hover:bg-orange/90 transition-all shadow-xs cursor-pointer"
                  >
                    Show All Categories
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredCategories.map((category) => {
                const count = allVendors.filter(
                  (v: { service?: { category: string }; offering?: { category: string } }) =>
                    (v.service || v.offering)?.category === category
                ).length;
                return (
                  <CategoryCard
                    key={category}
                    category={category}
                    vendorCount={count}
                    onClick={() => setSelectedCategory(category)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pop Window / Modal for selected category */}
      <CategoryModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        vendors={allVendors}
        loading={loading}
      />
    </div>
  );
};

export default MyVendors;