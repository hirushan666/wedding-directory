"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import Footer from "@/components/shared/Footer";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID, FIND_SERVICES_BY_VENDOR } from "@/graphql/queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiPlus,
  FiEdit,
  FiExternalLink,
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiLayers,
  FiMapPin,
  FiStar,
  FiPackage,
  FiArrowUpRight,
} from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { Service } from "@/types/serviceTypes";

const VendorServicesPage: React.FC = () => {
  const { vendor } = useVendorAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: vendorData, loading: vendorLoading } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const { data: servicesData, loading: servicesLoading, error: servicesError } = useQuery(
    FIND_SERVICES_BY_VENDOR,
    {
      variables: { id: vendor?.id },
      skip: !vendor?.id,
    }
  );

  const vendorInfo = vendorData?.findVendorById;
  const services: Service[] = useMemo(() => {
    return (servicesData?.findServicesByVendor || []).filter(Boolean);
  }, [servicesData]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || s.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg transition-colors duration-200 flex flex-col font-body">
      <VendorHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange/15 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange">
              Listing Management
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                My Services
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange/10 text-orange border border-orange/20">
                {services.length} {services.length === 1 ? "Listing" : "Listings"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
              Manage your published wedding services, edit packages, and keep your storefront up to date.
            </p>
          </div>

          <Link
            href="/vendor-dashboard/new-service"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-medium px-5 py-2.5 rounded-full transition-all text-sm shadow-xs self-start sm:self-auto shrink-0"
          >
            <FiPlus size={18} />
            <span>Add New Service</span>
          </Link>
        </div>

        {/* Search & Category Filter Toolbar */}
        {services.length > 0 && (
          <div className="bg-white dark:bg-darkSurface rounded-3xl p-4 sm:p-5 border border-orange/15 dark:border-zinc-800 shadow-xs space-y-3">
            {/* Search Input & Category Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-base" />
                <input
                  type="text"
                  placeholder="Search services by title, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm bg-lightYellow/60 dark:bg-darkElevated border border-orange/15 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-zinc-700 transition-colors"
                    title="Clear search"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>

              {/* Category Dropdown (Compact, No Overflow) */}
              {categories.length > 0 && (
                <div className="relative shrink-0 sm:w-56">
                  <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange text-xs pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-2xl text-xs font-semibold bg-lightYellow/60 dark:bg-darkElevated border border-orange/15 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-orange cursor-pointer appearance-none transition-all shadow-2xs"
                  >
                    <option value="all">All Categories ({services.length})</option>
                    {categories.map((cat) => {
                      const count = services.filter(
                        (s) => s.category?.toLowerCase() === cat.toLowerCase()
                      ).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                </div>
              )}
            </div>

            {/* Quick Filter Badges (Flex Wrap - No Horizontal Scroll) */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mr-1">
                  Quick Filter:
                </span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === "all"
                      ? "bg-orange text-white shadow-2xs"
                      : "bg-gray-100 dark:bg-darkElevated text-gray-600 dark:text-zinc-400 hover:bg-orange/10 hover:text-orange"
                  }`}
                >
                  All ({services.length})
                </button>
                {categories.map((cat) => {
                  const count = services.filter(
                    (s) => s.category?.toLowerCase() === cat.toLowerCase()
                  ).length;
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? "all" : cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${
                        isSelected
                          ? "bg-orange text-white shadow-2xs"
                          : "bg-gray-100 dark:bg-darkElevated text-gray-600 dark:text-zinc-400 hover:bg-orange/10 hover:text-orange"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}

                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="ml-auto text-xs font-semibold text-orange hover:underline pt-0.5"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {(servicesLoading || vendorLoading) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-darkSurface rounded-3xl overflow-hidden border border-orange/15 dark:border-zinc-800 p-4 space-y-4 shadow-xs"
              >
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Skeleton className="h-9 w-full rounded-xl" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {servicesError && (
          <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-center">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Error loading services: {servicesError.message}
            </p>
          </div>
        )}

        {/* Services Grid */}
        {!servicesLoading && !servicesError && (
          <>
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const rating = Number(service.reviews?.[0]?.rating) || 0;
                  const reviewsCount = service.reviews?.length || 0;

                  return (
                    <div
                      key={service.id}
                      className="bg-white dark:bg-darkSurface rounded-3xl overflow-hidden border border-orange/15 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Image Banner */}
                      <div className="relative h-48 sm:h-52 w-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                        <Image
                          src={service.banner || "/images/offeringPlaceholder.webp"}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Category Badge */}
                        {service.category && (
                          <div className="absolute top-3 left-3 bg-white/95 dark:bg-darkSurface/95 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider shadow-xs">
                            {service.category}
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h2 className="font-title text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange transition-colors line-clamp-1">
                            {service.name}
                          </h2>

                          {/* City & Rating */}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <FiMapPin className="text-orange" />
                              {service.vendor?.city || vendorInfo?.city || "Location available"}
                            </span>

                            {rating > 0 ? (
                              <span className="flex items-center gap-1 font-semibold text-amber-500">
                                <FiStar className="fill-amber-500" />
                                {rating.toFixed(1)}
                                <span className="text-gray-400 dark:text-zinc-500 font-normal">
                                  ({reviewsCount})
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-zinc-500">New Listing</span>
                            )}
                          </div>

                          {/* Description snippet */}
                          {service.description && (
                            <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center gap-2">
                          <Link
                            href={`/services/edit/${service.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange hover:bg-orange/90 text-white text-xs font-semibold transition-all shadow-2xs"
                          >
                            <FiEdit size={13} />
                            <span>Edit Service</span>
                          </Link>

                          <Link
                            href={`/services/${service.id}`}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-lightYellow dark:bg-darkElevated hover:bg-orange/10 dark:hover:bg-darkElevated/80 border border-orange/15 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-semibold transition-all"
                            title="View public visitor page"
                          >
                            <FiExternalLink size={13} />
                            <span className="hidden sm:inline">Preview</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : services.length > 0 ? (
              <div className="p-12 text-center bg-white dark:bg-darkSurface rounded-3xl border border-orange/15 dark:border-zinc-800">
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  No services match &quot;{searchQuery}&quot; in the selected category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-3 text-xs font-semibold text-orange hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              /* Zero Services Empty State */
              <div className="bg-white dark:bg-darkSurface rounded-3xl border border-orange/15 dark:border-zinc-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mb-4">
                  <MdAdd size={32} />
                </div>
                <h3 className="font-title text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                  No Services Listed Yet
                </h3>
                <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                  Create your first service listing to showcase your wedding packages, pricing, photos, and start receiving inquiries and bookings from couples.
                </p>
                <Link
                  href="/vendor-dashboard/new-service"
                  className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-medium px-6 py-3 rounded-full transition-all shadow-sm text-sm"
                >
                  <FiPlus size={18} />
                  <span>Create First Service</span>
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VendorServicesPage;
