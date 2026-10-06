"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import OfferingCard from "@/components/vendor-search/OfferingCard";
import { ServiceDetailSkeleton } from "@/components/ui/shimmer";
import { OfferingGridSkeleton } from "@/components/ui/shimmer";
import {
  FIND_VENDOR_BY_SLUG,
  FIND_VENDOR_SERVICES_BY_ID,
  GET_VENDOR_BY_ID,
} from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import { getServiceUrl } from "@/utils/serviceUrl";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiShare2,
  FiCheckCircle,
  FiBriefcase,
  FiTag,
  FiSearch,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

// Detect whether the slug param is a UUID or a human-readable slug
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VendorPublicPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const rawSlug = (params?.slug as string) || "";
  const slugParam = decodeURIComponent(rawSlug).trim();

  const isUUID = UUID_REGEX.test(slugParam);

  // Try slug-based lookup (for human-readable slugs)
  const {
    data: slugData,
    loading: slugLoading,
    error: slugError,
  } = useQuery(FIND_VENDOR_BY_SLUG, {
    variables: { slug: slugParam.toLowerCase() },
    skip: isUUID,
    fetchPolicy: "cache-and-network",
  });

  // ID-based lookup — runs when param is a UUID, or as fallback when slug lookup returns no vendor
  const shouldTryId = isUUID || (!slugLoading && !slugData?.findVendorBySlug);
  const {
    data: idData,
    loading: idLoading,
    error: idError,
  } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: slugParam },
    skip: !shouldTryId,
    fetchPolicy: "cache-and-network",
  });

  // Resolve the vendor from whichever query returned data
  const vendor = slugData?.findVendorBySlug || idData?.findVendorById || null;
  const vendorId = vendor?.id || null;

  // If we loaded by UUID but the vendor has a slug, redirect to the canonical slug URL
  useEffect(() => {
    if (vendor?.slug && isUUID) {
      router.replace(`/vendors/${vendor.slug}`);
    }
  }, [vendor?.slug, isUUID, router]);

  // Fetch the vendor's services once we have their ID
  const { data: servicesData, loading: servicesLoading } = useQuery(
    FIND_VENDOR_SERVICES_BY_ID,
    {
      variables: { id: vendorId },
      skip: !vendorId,
      fetchPolicy: "cache-and-network",
    },
  );

  const allServices = servicesData?.findServicesByVendor || [];
  const visibleServices = useMemo(
    () => allServices.filter((s: any) => s.visible !== false),
    [allServices],
  );

  // Set browser tab title
  useEffect(() => {
    if (vendor?.busname) {
      document.title = `${vendor.busname} | Say I Do`;
    }
  }, [vendor]);

  // Filter & Search state for services
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    visibleServices.forEach((s: any) => {
      if (s.category && typeof s.category === "string") {
        set.add(s.category.trim());
      }
    });
    return Array.from(set);
  }, [visibleServices]);

  // Calculate review and rating statistics
  const { totalReviews, avgRating } = useMemo(() => {
    let count = 0;
    let sum = 0;
    visibleServices.forEach((s: any) => {
      if (Array.isArray(s.reviews) && s.reviews.length > 0) {
        s.reviews.forEach((r: any) => {
          const ratingVal = Number(r.rating || 0);
          if (ratingVal > 0) {
            count++;
            sum += ratingVal;
          }
        });
      }
    });
    return {
      totalReviews: count,
      avgRating: count > 0 ? sum / count : 0,
    };
  }, [visibleServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return visibleServices.filter((s: any) => {
      const matchCat =
        selectedCategory === "All" || s.category === selectedCategory;
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [visibleServices, selectedCategory, searchQuery]);

  // Share profile handler
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Vendor profile link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const isLoading = isUUID
    ? idLoading
    : slugLoading || (shouldTryId && idLoading && !idData && !slugData?.findVendorBySlug);

  const notFound = !isLoading && !vendor;

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (notFound || (!isLoading && (isUUID ? idError : slugError && idError))) {
    return (
      <div className="bg-lightYellow dark:bg-darkBg font-body min-h-screen flex flex-col transition-colors duration-200">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange/10 dark:bg-orange/15 flex items-center justify-center text-orange">
              <FiBriefcase className="w-8 h-8" />
            </div>
            <h2 className="font-title font-bold text-2xl text-gray-900 dark:text-zinc-100 mb-2">
              Vendor Not Found
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-body mb-6">
              We couldn&apos;t find this vendor. They may have changed their
              profile URL or are temporarily unavailable.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange text-white font-semibold text-sm hover:bg-orange/90 transition-all shadow-xs"
            >
              Browse all services
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const joinedYear = vendor?.createdAt
    ? new Date(vendor.createdAt).getFullYear()
    : null;

  const profilePic =
    !imgError && vendor?.profile_pic_url ? vendor.profile_pic_url : null;

  const contactName = [vendor.fname, vendor.lname].filter(Boolean).join(" ");

  // Cover image: either first service banner or placeholder
  const heroCoverImage = visibleServices[0]?.banner || null;

  return (
    <div className="bg-lightYellow dark:bg-darkBg font-body min-h-screen flex flex-col transition-colors duration-200">
      <Header />

      <main className="flex-1 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 w-full">
          {/* Back Navigation */}
          <div className="mb-3 sm:mb-4 pt-1">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-orange dark:hover:text-orange transition-colors group"
            >
              <FiArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" />
              <span>Back to Services</span>
            </Link>
          </div>

          {/* Optimized Vendor Profile Card */}
          <section className="bg-white dark:bg-darkSurface rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden mb-6 sm:mb-10 transition-colors">
            {/* Top Cover Banner */}
            <div className="relative h-28 sm:h-44 md:h-48 w-full bg-gradient-to-r from-orange/20 via-amber-100/50 to-orange/10 dark:from-orange/25 dark:via-zinc-900/90 dark:to-darkElevated overflow-hidden border-b border-orange/10 dark:border-zinc-800/80">
              {heroCoverImage && (
                <div className="absolute inset-0 opacity-20 dark:opacity-15 blur-[2px] scale-105 pointer-events-none">
                  <Image
                    src={heroCoverImage}
                    alt="Cover decoration"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {/* Subtle decorative mesh overlay */}
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-white/40 dark:to-darkSurface/60 pointer-events-none" />
            </div>

            {/* Profile Content Body */}
            <div className="px-4 sm:px-8 pb-5 sm:pb-8 pt-0">
              {/* Header row with Avatar + Info + Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
                  {/* Top bar on mobile: Avatar on left, Share button on right */}
                  <div className="flex items-end justify-between sm:block">
                    <div className="-mt-10 sm:-mt-14 relative z-10 flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white dark:bg-darkElevated ring-4 ring-white dark:ring-darkSurface shadow-md border border-orange/20 dark:border-zinc-700">
                      {profilePic ? (
                        <Image
                          src={profilePic}
                          alt={vendor.busname}
                          fill
                          className="object-cover"
                          onError={() => setImgError(true)}
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange/15 to-orange/5 dark:from-darkElevated dark:to-darkSurface">
                          <span className="text-2xl sm:text-4xl font-title font-bold text-orange">
                            {(vendor?.busname?.[0] || "V").toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mobile-only share button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange hover:bg-orange/90 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer mb-1"
                      title="Share vendor profile"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="text-white text-sm" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiShare2 className="text-white text-sm" />
                          <span>Share Profile</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 sm:pt-4">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap mb-1 sm:mb-1.5">
                      <h1 className="font-title text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                        {vendor.busname}
                      </h1>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 font-body">
                          <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" />
                          Verified Vendor
                        </span>
                        {avgRating >= 4.5 && totalReviews > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 font-body">
                            <FaStar className="text-amber-500 text-[10px] sm:text-xs" />
                            Top Rated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-body">
                      {contactName && (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <FiUser className="text-orange flex-shrink-0 text-xs sm:text-sm" />
                          <span>Owner: {contactName}</span>
                        </div>
                      )}
                      {vendor.city && (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <FiMapPin className="text-orange flex-shrink-0 text-xs sm:text-sm" />
                          <span>{vendor.city}</span>
                        </div>
                      )}
                      {joinedYear && (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <FiCalendar className="text-orange flex-shrink-0 text-xs sm:text-sm" />
                          <span>Member since {joinedYear}</span>
                        </div>
                      )}
                      {totalReviews > 0 && (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <FaStar className="text-amber-400 flex-shrink-0 text-[11px] sm:text-xs" />
                          <span className="font-semibold text-gray-900 dark:text-zinc-200">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-gray-500 dark:text-zinc-500">
                            ({totalReviews}{" "}
                            {totalReviews === 1 ? "review" : "reviews"})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop-only Share Profile Action Button */}
                <div className="hidden sm:flex items-center flex-shrink-0 pt-4">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white font-semibold text-sm transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                    title="Share vendor profile"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="text-white text-base" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <FiShare2 className="text-white text-base" />
                        <span>Share Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4-Item Quick Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 my-3.5 sm:my-6">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/80 dark:bg-darkElevated/60 border border-gray-100 dark:border-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400 mb-0.5 sm:mb-1">
                    <FiBriefcase className="text-orange text-xs sm:text-sm flex-shrink-0" />
                    <span>Listings</span>
                  </div>
                  <p className="font-title text-base sm:text-xl font-bold text-gray-900 dark:text-zinc-100">
                    {visibleServices.length}{" "}
                    <span className="text-[11px] sm:text-xs font-normal text-gray-500 dark:text-zinc-400 font-body">
                      {visibleServices.length === 1 ? "service" : "services"}
                    </span>
                  </p>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/80 dark:bg-darkElevated/60 border border-gray-100 dark:border-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400 mb-0.5 sm:mb-1">
                    <FaStar className="text-amber-400 text-xs sm:text-sm flex-shrink-0" />
                    <span>Average Rating</span>
                  </div>
                  <p className="font-title text-base sm:text-xl font-bold text-gray-900 dark:text-zinc-100">
                    {totalReviews > 0 ? avgRating.toFixed(1) : "New"}{" "}
                    <span className="text-[11px] sm:text-xs font-normal text-gray-500 dark:text-zinc-400 font-body">
                      {totalReviews > 0
                        ? `(${totalReviews})`
                        : "No reviews"}
                    </span>
                  </p>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/80 dark:bg-darkElevated/60 border border-gray-100 dark:border-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400 mb-0.5 sm:mb-1">
                    <FiTag className="text-orange text-xs sm:text-sm flex-shrink-0" />
                    <span>Specialties</span>
                  </div>
                  <p className="font-title text-base sm:text-xl font-bold text-gray-900 dark:text-zinc-100">
                    {categories.length}{" "}
                    <span className="text-[11px] sm:text-xs font-normal text-gray-500 dark:text-zinc-400 font-body">
                      {categories.length === 1 ? "category" : "categories"}
                    </span>
                  </p>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/80 dark:bg-darkElevated/60 border border-gray-100 dark:border-zinc-800/80 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-zinc-400 mb-0.5 sm:mb-1">
                    <FiMapPin className="text-orange text-xs sm:text-sm flex-shrink-0" />
                    <span>Base Location</span>
                  </div>
                  <p className="font-title text-base sm:text-xl font-bold text-gray-900 dark:text-zinc-100 truncate">
                    {vendor.city || "Sri Lanka"}
                  </p>
                </div>
              </div>

              {/* About and Specialties Box */}
              <div className="rounded-xl sm:rounded-2xl bg-gray-50/70 dark:bg-darkElevated/40 border border-gray-100 dark:border-zinc-800/80 p-3.5 sm:p-6 transition-colors">
                <h2 className="font-title font-bold text-sm sm:text-lg text-gray-900 dark:text-zinc-100 mb-1.5 sm:mb-2.5">
                  About {vendor.busname}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-body">
                  {vendor.about ||
                    `Welcome to ${vendor.busname}'s official portfolio on Say I Do. Explore all wedding services below or connect directly for custom packages and availability.`}
                </p>

                {/* Category Specialties tags */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/60 dark:border-zinc-800">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-zinc-400 mr-1">
                      Specialties:
                    </span>
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-orange/5 dark:bg-orange/10 border border-orange/20 text-[11px] sm:text-xs font-medium text-orange"
                      >
                        <FiTag className="text-[10px] sm:text-xs" />
                        <span>{cat}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Services Portfolio Section */}
          <section>
            {/* Header + Search & Category Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <h2 className="font-title font-bold text-lg sm:text-2xl text-gray-900 dark:text-zinc-100">
                  Services offered
                </h2>
                <span className="px-2.5 sm:px-3 py-0.5 text-xs font-bold rounded-full bg-orange/10 dark:bg-orange/15 text-orange border border-orange/20 dark:border-orange/25 font-body">
                  {visibleServices.length}{" "}
                  {visibleServices.length === 1 ? "service" : "services"}
                </span>
              </div>

              {/* Search input if multiple services */}
              {visibleServices.length > 2 && (
                <div className="relative w-full sm:w-72">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vendor services..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition-all font-body"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Category Filter Pills (if more than 1 category) */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 mb-4 sm:mb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === "All"
                      ? "bg-orange text-white shadow-xs"
                      : "bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-orange hover:text-orange"
                  }`}
                >
                  All ({visibleServices.length})
                </button>
                {categories.map((cat) => {
                  const count = visibleServices.filter(
                    (s: any) => s.category === cat,
                  ).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                        isSelected
                          ? "bg-orange text-white shadow-xs"
                          : "bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-orange hover:text-orange"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Services Grid or Skeleton */}
            {servicesLoading ? (
              <OfferingGridSkeleton count={4} />
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
                {filteredServices.map((service: any) => {
                  const avgRating =
                    service.reviews?.length > 0
                      ? service.reviews.reduce(
                          (acc: number, r: any) => acc + Number(r.rating),
                          0,
                        ) / service.reviews.length
                      : 0;

                  return (
                    <OfferingCard
                      key={service.id}
                      id={service.id}
                      name={service.name}
                      vendor={vendor.busname}
                      vendorId={vendor.id}
                      vendorSlug={vendor.slug}
                      hideVendor
                      city={service.city || vendor.city || ""}
                      banner={
                        service.banner || "/images/offeringPlaceholder.webp"
                      }
                      rating={avgRating}
                      buttonText="View Details"
                      link={getServiceUrl(service)}
                    />
                  );
                })}
              </div>
            ) : visibleServices.length > 0 ? (
              /* No matching search/filter results */
              <div className="bg-white dark:bg-darkSurface rounded-3xl border border-gray-200 dark:border-zinc-800 p-12 text-center shadow-xs max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-orange/10 dark:bg-orange/15 text-orange flex items-center justify-center mx-auto mb-3">
                  <FiSearch className="text-xl" />
                </div>
                <h3 className="font-title font-bold text-lg text-gray-900 dark:text-zinc-100 mb-1">
                  No matching services
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 font-body mb-4">
                  No services found for your current search or category filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-orange text-white text-xs font-semibold hover:bg-orange/90 transition-all shadow-xs"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              /* Completely empty vendor */
              <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 p-12 text-center shadow-xs max-w-md mx-auto">
                <p className="text-sm text-gray-500 dark:text-zinc-400 font-body">
                  This vendor hasn&apos;t listed any services yet.
                </p>
                <Link
                  href="/services"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-orange text-white text-xs font-semibold hover:bg-orange/90 transition-all shadow-xs"
                >
                  Browse all services
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorPublicPage;
