"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { FiGrid, FiMapPin } from "react-icons/fi";
import { SearchBarProps } from "@/types/homeTypes";
import categories from "../../utils/category.json";
import citiesData from "../../utils/city.json";
import { useRouter } from "next/navigation";

const SearchBar: React.FC<SearchBarProps> = ({
  showIcon = true,
  placehHolderText = "Search venues, photographers, Colombo...",
  className = "",
  size = "default",
  disabled = false,
}) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isLarge = size === "large";

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Memoize unique district list (Sri Lanka's 25 districts)
  const uniqueDistricts = useMemo(() => {
    return Array.from(new Set(citiesData.map((c) => c.District))).sort();
  }, []);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input change and search filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const q = value.toLowerCase().trim();
      const matchedCats = categories.filter((category) =>
        category.toLowerCase().includes(q)
      );
      const matchedDistricts = uniqueDistricts
        .filter((district) => district.toLowerCase().includes(q))
        .slice(0, 4);

      setFilteredCategories(matchedCats);
      setFilteredCities(matchedDistricts);
      setIsOpen(matchedCats.length > 0 || matchedDistricts.length > 0);
    } else {
      setFilteredCategories([]);
      setFilteredCities([]);
      setIsOpen(false);
    }
  };

  // Submit search query
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled) return;
    const q = searchTerm.trim();
    setIsOpen(false);

    if (!q) {
      router.push("/services");
      return;
    }

    // Exact or case-insensitive category match
    const exactCat = categories.find(
      (cat) => cat.toLowerCase() === q.toLowerCase()
    );
    if (exactCat) {
      router.push(`/services?category=${encodeURIComponent(exactCat)}`);
      return;
    }

    // Exact or case-insensitive district match
    const exactDistrict = uniqueDistricts.find(
      (district) => district.toLowerCase() === q.toLowerCase()
    );
    if (exactDistrict) {
      router.push(`/services?city=${encodeURIComponent(exactDistrict)}`);
      return;
    }

    // First filtered category if available
    if (filteredCategories.length > 0) {
      router.push(
        `/services?category=${encodeURIComponent(filteredCategories[0])}`
      );
      return;
    }

    // First filtered city if available
    if (filteredCities.length > 0) {
      router.push(`/services?city=${encodeURIComponent(filteredCities[0])}`);
      return;
    }

    // Generic search query for vendor names, service titles, or descriptions
    router.push(`/services?q=${encodeURIComponent(q)}`);
  };

  const handleSelectCategory = (cat: string) => {
    setSearchTerm(cat);
    setIsOpen(false);
    router.push(`/services?category=${encodeURIComponent(cat)}`);
  };

  const handleSelectCity = (city: string) => {
    setSearchTerm(city);
    setIsOpen(false);
    router.push(`/services?city=${encodeURIComponent(city)}`);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilteredCategories([]);
    setFilteredCities([]);
    setIsOpen(false);
  };

  const hasSuggestions =
    !disabled && isOpen && (filteredCategories.length > 0 || filteredCities.length > 0);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full max-w-md ${className}`}
    >
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <input
          type="text"
          placeholder={placehHolderText}
          value={searchTerm}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => {
            if (disabled) return;
            if (
              searchTerm.trim() &&
              (filteredCategories.length > 0 || filteredCities.length > 0)
            ) {
              setIsOpen(true);
            }
          }}
          className={`w-full rounded-full border border-orange/30 dark:border-zinc-700 bg-white dark:bg-darkElevated focus:bg-white dark:focus:bg-darkElevated text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange/25 focus:border-orange transition-all font-body ${
            disabled
              ? "opacity-60 cursor-not-allowed bg-gray-100/80 dark:bg-zinc-800/40 border-gray-300 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 placeholder:text-gray-400/80 dark:placeholder:text-zinc-600 select-none shadow-none"
              : ""
          } ${
            isLarge
              ? "h-14 sm:h-16 text-sm sm:text-base shadow-lg pl-12 sm:pl-14 pr-20 sm:pr-24"
              : `py-2 text-xs sm:text-sm shadow-xs ${showIcon ? "pl-9" : "pl-4"} ${searchTerm ? "pr-16" : "pr-9"}`
          }`}
        />

        {showIcon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-gray-400 dark:text-zinc-400 ${
              isLarge ? "left-4 sm:left-5" : "left-3"
            }`}
          >
            <MdSearch className={isLarge ? "w-6 h-6 text-gray-400 dark:text-zinc-400" : "w-5 h-5"} />
          </div>
        )}

        {/* Clear Button */}
        {!disabled && searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors ${
              isLarge ? "right-[52px] sm:right-[60px] p-1 rounded-full" : "right-9 pr-1"
            }`}
            title="Clear search"
          >
            <MdClose className={isLarge ? "w-5 h-5" : "w-4 h-4"} />
          </button>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={disabled}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all shadow-sm ${
            disabled
              ? "bg-gray-300 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
              : "bg-orange hover:bg-orange/90 text-white active:scale-95 cursor-pointer"
          } ${
            isLarge
              ? "right-2 w-10 h-10 sm:w-12 sm:h-12"
              : "right-1.5 w-7 h-7"
          }`}
          title={disabled ? "Search disabled" : "Search"}
        >
          <MdSearch className={isLarge ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4"} />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {hasSuggestions && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-darkSurface rounded-2xl shadow-xl border border-orange/20 dark:border-zinc-800 overflow-hidden z-50 font-body divide-y divide-orange/10 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Categories */}
          {filteredCategories.length > 0 && (
            <div className="p-1.5">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange/80 flex items-center gap-1.5">
                <FiGrid className="w-3 h-3" /> Services
              </div>
              <div className="space-y-0.5">
                {filteredCategories.slice(0, 5).map((category, index) => (
                  <button
                    key={`cat-${index}`}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-800 dark:text-zinc-200 hover:bg-orange/10 dark:hover:bg-darkElevated hover:text-orange dark:hover:text-orange flex items-center justify-between transition-colors group"
                  >
                    <span>{category}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange/10 text-orange border border-orange/20 opacity-80 group-hover:opacity-100">
                      Service
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities */}
          {filteredCities.length > 0 && (
            <div className="p-1.5">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange/80 flex items-center gap-1.5">
                <FiMapPin className="w-3 h-3" /> Locations
              </div>
              <div className="space-y-0.5">
                {filteredCities.map((city, index) => (
                  <button
                    key={`city-${index}`}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-800 dark:text-zinc-200 hover:bg-orange/10 dark:hover:bg-darkElevated hover:text-orange dark:hover:text-orange flex items-center justify-between transition-colors group"
                  >
                    <span>{city}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-darkElevated text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 group-hover:bg-orange/10 group-hover:text-orange group-hover:border-orange/20">
                      City
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
