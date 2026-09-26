"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Headers/Header";
import OfferingCard from "@/components/vendor-search/OfferingCard";
import { FIND_SERVICES, FIND_ALL_MY_VENDORS, GET_VISITOR_BY_ID } from "@/graphql/queries";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useAuth } from "@/contexts/VisitorAuthContext";
import FilterSearchBar from "@/components/vendor-search/FilterSearchBar";
import { Offering } from "@/types/offeringTypes";
import { OfferingGridSkeleton } from "@/components/ui/shimmer";
import { IoClose } from "react-icons/io5";
import { detectUserDistrict, matchSriLankaDistrict } from "@/utils/geolocation";
import toast from "react-hot-toast";

const ServicesSearchContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { visitor, isInitialized: authInitialized } = useAuth();

  const urlCategory = searchParams.get("category") || "";
  const urlCity = searchParams.get("city") || "";
  const urlQuery = searchParams.get("q") || "";

  const [city, setCity] = useState<string>(urlCity);
  const [category, setCategory] = useState<string>(urlCategory);
  const [keyword, setKeyword] = useState<string>(urlQuery);

  const { data: myVendorsData } = useQuery(FIND_ALL_MY_VENDORS, {
    variables: { visitorId: visitor?.id },
    skip: !visitor?.id,
    fetchPolicy: "cache-and-network",
  });

  // Query visitor profile to check their district if logged in
  const { data: visitorProfileData, loading: visitorLoading } = useQuery(
    GET_VISITOR_BY_ID,
    {
      variables: { id: visitor?.id },
      skip: !visitor?.id,
      fetchPolicy: "cache-first",
    },
  );

  const hasInitializedLocationRef = useRef(false);

  const savedServiceIds = useMemo(() => {
    const ids = new Set<string>();
    const list = myVendorsData?.findAllMyVendors || [];
    list.forEach((item: any) => {
      const sId = item.service?.id || item.offering?.id;
      if (sId) ids.add(sId);
    });
    return ids;
  }, [myVendorsData]);

  // useLazyQuery hook to fetch services on demand with network-only fetch policy
  const [getServices, { loading, data, error }] = useLazyQuery(FIND_SERVICES, {
    fetchPolicy: "network-only",
  });

  // Helper to execute Apollo query
  const executeQuery = useCallback(
    (targetCity: string, targetCategory: string) => {
      getServices({
        variables: {
          filter: {
            city: targetCity ? targetCity.trim() : null,
            category: targetCategory ? targetCategory.trim() : null,
          },
        },
      });
    },
    [getServices],
  );

  // Sync state and run search when URL query parameters change
  useEffect(() => {
    setCategory(urlCategory);
    setCity(urlCity);
    setKeyword(urlQuery);
    executeQuery(urlCity, urlCategory);
  }, [urlCategory, urlCity, urlQuery, executeQuery]);

  // Auto-default district filter:
  // 1. If visitor is logged in and has a district in profile -> default to their district
  // 2. If visitor is logged in without a district OR user is not logged in -> detect via browser geolocation (if permitted)
  // 3. If explicit city already in URL or user has manually cleared filters -> do not override
  useEffect(() => {
    if (urlCity) {
      hasInitializedLocationRef.current = true;
      return;
    }

    if (hasInitializedLocationRef.current) {
      return;
    }

    if (!authInitialized) {
      return;
    }

    if (visitor?.id && visitorLoading) {
      return;
    }

    hasInitializedLocationRef.current = true;

    // Case A: Logged-in visitor with district in profile
    if (visitor?.id) {
      const profile = visitorProfileData?.findVisitorById;
      const visitorDistrict = matchSriLankaDistrict(
        profile?.city || profile?.wed_venue,
      );
      if (visitorDistrict) {
        setCity(visitorDistrict);
        const params = new URLSearchParams(searchParams.toString());
        params.set("city", visitorDistrict);
        router.replace(`/services?${params.toString()}`);
        return;
      }
    }

    // Case B: Not logged in OR visitor with no district in profile -> Check cached session district
    const cachedDistrict =
      typeof window !== "undefined"
        ? sessionStorage.getItem("user_detected_district")
        : null;

    if (cachedDistrict) {
      setCity(cachedDistrict);
      const params = new URLSearchParams(searchParams.toString());
      params.set("city", cachedDistrict);
      router.replace(`/services?${params.toString()}`);
      return;
    }

    // Case C: Request browser location (if permitted)
    const alreadyPrompted =
      typeof window !== "undefined"
        ? sessionStorage.getItem("geo_prompted")
        : null;

    if (!alreadyPrompted) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("geo_prompted", "true");
      }
      detectUserDistrict().then((district) => {
        if (district) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("user_detected_district", district);
          }
          setCity(district);
          const params = new URLSearchParams(window.location.search);
          params.set("city", district);
          router.replace(`/services?${params.toString()}`);
          toast.success(`Showing services in your district: ${district}`);
        }
      });
    }
  }, [
    urlCity,
    authInitialized,
    visitor?.id,
    visitorLoading,
    visitorProfileData,
    searchParams,
    router,
  ]);

  // Handlers for filter changes from FilterSearchBar
  const handleCityChange = useCallback(
    (newCity: string) => {
      setCity(newCity);
      const params = new URLSearchParams(searchParams.toString());
      if (newCity && newCity.trim()) {
        params.set("city", newCity.trim());
      } else {
        params.delete("city");
      }
      const qs = params.toString();
      router.push(qs ? `/services?${qs}` : "/services");
    },
    [searchParams, router],
  );

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      setCategory(newCategory);
      const params = new URLSearchParams(searchParams.toString());
      if (newCategory && newCategory.trim()) {
        params.set("category", newCategory.trim());
      } else {
        params.delete("category");
      }
      const qs = params.toString();
      router.push(qs ? `/services?${qs}` : "/services");
    },
    [searchParams, router],
  );

  // Search button click handler
  const handleSearch = useCallback(
    (targetCity?: string, targetCategory?: string) => {
      const activeCity = targetCity !== undefined ? targetCity : city;
      const activeCategory =
        targetCategory !== undefined ? targetCategory : category;

      const params = new URLSearchParams(searchParams.toString());
      if (activeCity && activeCity.trim()) {
        params.set("city", activeCity.trim());
      } else {
        params.delete("city");
      }
      if (activeCategory && activeCategory.trim()) {
        params.set("category", activeCategory.trim());
      } else {
        params.delete("category");
      }
      if (keyword && keyword.trim()) {
        params.set("q", keyword.trim());
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.push(qs ? `/services?${qs}` : "/services");
    },
    [city, category, keyword, searchParams, router],
  );

  // Remove individual filter chip handlers
  const removeCategory = () => {
    setCategory("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  };

  const removeCity = () => {
    setCity("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("city");
    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  };

  const removeKeyword = () => {
    setKeyword("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  };

  const clearAllFilters = () => {
    setCategory("");
    setCity("");
    setKeyword("");
    router.push("/services");
  };

  // Extract offerings from GraphQL response
  const rawOfferings: Offering[] = data?.findServices || [];

  // Filter offerings in-memory
  const visibleOfferings = rawOfferings.filter((offering: Offering) => {
    if (offering.visible === false) return false;

    // In-memory verification for active category filter
    if (category && category.trim()) {
      const catTarget = category.toLowerCase().trim();
      const offCat = (offering.category || "").toLowerCase().trim();
      if (!offCat.includes(catTarget) && !catTarget.includes(offCat)) {
        return false;
      }
    }

    // In-memory verification for active city filter
    if (city && city.trim()) {
      const cityTarget = city.toLowerCase().trim();
      const offCity = (offering.city || offering.vendor?.city || "").toLowerCase().trim();
      const offLoc = (offering.location || "").toLowerCase().trim();
      if (
        !offCity.includes(cityTarget) &&
        !offLoc.includes(cityTarget) &&
        !catTargetMatch(offCity, cityTarget)
      ) {
        return false;
      }
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const matchName = offering.name?.toLowerCase().includes(q);
      const matchBus = offering.vendor?.busname?.toLowerCase().includes(q);
      const matchCat = offering.category?.toLowerCase().includes(q);
      const matchCity = (offering.city || offering.vendor?.city || "")?.toLowerCase().includes(q);
      const matchLoc = offering.location?.toLowerCase().includes(q);
      const matchDesc = offering.description?.toLowerCase().includes(q);
      if (!matchName && !matchBus && !matchCat && !matchCity && !matchLoc && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  function catTargetMatch(offCity: string, cityTarget: string) {
    return offCity.includes(cityTarget) || cityTarget.includes(offCity);
  }

  const hasActiveFilters = Boolean(category || city || keyword);

  return (
    <div className="bg-lightYellow dark:bg-darkBg font-title min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 text-center w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
            Find the perfect services for your wedding
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1 font-body">
            Filter by Service, Location, or Keyword
          </p>
        </div>

        <FilterSearchBar
          handleSearch={handleSearch}
          onCityChange={handleCityChange}
          onCategoryChange={handleCategoryChange}
          selectedCategory={category}
          selectedCity={city}
        />

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 w-full flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 font-body mr-1">
              Active filters:
            </span>

            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange/15 text-orange border border-orange/25 font-body">
                <span>Service: {category}</span>
                <button
                  type="button"
                  onClick={removeCategory}
                  className="hover:text-gray-900 dark:hover:text-zinc-100 p-0.5 rounded-full hover:bg-orange/20 transition-colors"
                  title="Remove category filter"
                >
                  <IoClose className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange/15 text-orange border border-orange/25 font-body">
                <span>City: {city}</span>
                <button
                  type="button"
                  onClick={removeCity}
                  className="hover:text-gray-900 dark:hover:text-zinc-100 p-0.5 rounded-full hover:bg-orange/20 transition-colors"
                  title="Remove city filter"
                >
                  <IoClose className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {keyword && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange/15 text-orange border border-orange/25 font-body">
                <span>Keyword: &quot;{keyword}&quot;</span>
                <button
                  type="button"
                  onClick={removeKeyword}
                  className="hover:text-gray-900 dark:hover:text-zinc-100 p-0.5 rounded-full hover:bg-orange/20 transition-colors"
                  title="Remove keyword search"
                >
                  <IoClose className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-orange underline ml-2 font-body transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="border-b border-orange/15 dark:border-zinc-800 my-4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          {/* Main Content - Full Width Catalog */}
          <div className="w-full">
            {/* Data Loading/Error/Result State */}
            {loading ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-7 w-48 rounded-lg bg-gray-200/80 dark:bg-darkElevated animate-pulse" />
                </div>
                <OfferingGridSkeleton count={8} />
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-rose-200 dark:border-rose-900/50 p-8 text-center my-6 max-w-md mx-auto">
                <p className="text-rose-600 dark:text-rose-400 font-medium text-sm font-body">
                  Oops! We encountered an issue loading services. Please try
                  again in a moment.
                </p>
              </div>
            ) : visibleOfferings.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="font-title font-bold text-xl sm:text-2xl text-gray-900 dark:text-zinc-100">
                      Available Services
                    </h2>
                    <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-orange/10 text-orange border border-orange/20 font-body">
                      {visibleOfferings.length} found
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleOfferings.map((offering: Offering) => (
                    <OfferingCard
                      key={offering.id}
                      id={offering.id}
                      name={offering.name}
                      vendor={offering.vendor?.busname || "N/A"}
                      city={offering.vendor?.city || "N/A"}
                      banner={
                        offering.banner || "/images/offeringPlaceholder.webp"
                      }
                      rating={
                        offering.reviews.length > 0
                          ? offering.reviews.reduce(
                              (acc, review) => acc + Number(review.rating),
                              0,
                            ) / offering.reviews.length
                          : 0
                      }
                      buttonText="View Details"
                      link={`/services/${offering.id}`}
                      isSaved={savedServiceIds.has(offering.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 p-12 text-center my-8 shadow-xs max-w-md mx-auto">
                <h3 className="font-title font-bold text-lg text-gray-900 dark:text-zinc-100 mb-1">
                  No services found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
                  Try adjusting your city, category, or keyword search to
                  discover more wedding services.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 rounded-full bg-orange text-white text-xs font-semibold hover:bg-orange/90 transition-all shadow-xs"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ServicesPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-lightYellow dark:bg-darkBg p-8 max-w-7xl mx-auto pt-24">
          <OfferingGridSkeleton count={8} />
        </div>
      }
    >
      <ServicesSearchContent />
    </Suspense>
  );
};

export default ServicesPage;
