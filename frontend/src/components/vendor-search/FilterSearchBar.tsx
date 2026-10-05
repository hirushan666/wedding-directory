import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import CategoryInput from "./CategoryInput";
import CityInput from "./CityInput";
import { FilterSearchBarProps } from "@/types/offeringTypes";

const FilterSearchBar: React.FC<FilterSearchBarProps> = ({
  onCategoryChange,
  onCityChange,
  handleSearch,
  selectedCategory,
  selectedCity,
}) => {
  const [category, setCategory] = useState<string>(selectedCategory || "");
  const [city, setCity] = useState<string>(selectedCity || "");

  useEffect(() => {
    setCategory(selectedCategory || "");
  }, [selectedCategory]);

  useEffect(() => {
    setCity(selectedCity || "");
  }, [selectedCity]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    onCategoryChange(newCategory);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    onCityChange(newCity);
  };

  const onSearch = () => {
    handleSearch(city, category);
  };

  return (
    <div className="flex items-center justify-center px-3 sm:px-4 py-0.5 sm:py-1">
      <div className="flex items-center bg-white dark:bg-darkSurface shadow-xs rounded-full border-2 border-orange/20 dark:border-zinc-700 w-full max-w-2xl h-11 sm:h-[56px] px-2 sm:px-4 gap-1.5 sm:gap-3">
        {/* Category Input */}
        <div className="relative flex-1 min-w-0 flex flex-col justify-center">
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-orange/80 px-1 sm:px-2 leading-none truncate">
            Category
          </span>
          <CategoryInput
            value={category}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-orange/20 dark:bg-zinc-700 shrink-0" />

        {/* Location Input */}
        <div className="relative flex-1 min-w-0 flex flex-col justify-center">
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-orange/80 px-1 sm:px-2 leading-none truncate">
            Location
          </span>
          <CityInput
            placeholder="City"
            value={city}
            onCityChange={handleCityChange}
          />
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={onSearch}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange hover:bg-orange/90 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer"
          title="Search vendors"
          aria-label="Search vendors"
        >
          <IoIosSearch className="text-base sm:text-xl" />
        </button>
      </div>
    </div>
  );
};

export default FilterSearchBar;
