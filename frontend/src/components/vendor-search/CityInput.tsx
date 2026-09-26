"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import cities from "../../utils/city.json";
import { CityProps } from "@/types/signupInput";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

const CityInput: React.FC<CityProps> = ({ onCityChange, value }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(value || null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setSelectedCity(value || null);
  }, [value]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city ? city : null);
    onCityChange(city);
    setSearchTerm("");
  };

  const districts = useMemo(() => {
    return [...new Set(cities.map((city) => city.District))].sort();
  }, []);

  const filteredDistricts = useMemo(() => {
    if (!searchTerm.trim()) return districts;
    const q = searchTerm.toLowerCase().trim();
    return districts.filter((d) => d.toLowerCase().includes(q));
  }, [districts, searchTerm]);

  return (
    <div className="w-full font-body">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex justify-between items-center w-full text-left px-2 py-0 text-gray-800 dark:text-zinc-100 bg-transparent hover:bg-transparent transition duration-150 font-medium text-xs sm:text-sm h-7 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none dark:focus:ring-0 dark:focus:ring-offset-0 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0 dark:focus-visible:outline-none border-none rounded-none shadow-none outline-none ring-0 cursor-pointer"
          >
            <span className="font-body font-medium truncate">
              {selectedCity || "Select District"}
            </span>
            <ChevronDown className="ml-1 h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white/95 dark:bg-darkElevated/95 backdrop-blur-sm rounded-xl shadow-lg font-body z-10 border border-orange/15 dark:border-zinc-700 p-1">
          {/* Quick Search */}
          <div className="p-2 border-b border-gray-100 dark:border-zinc-700/60 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full text-xs bg-transparent text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          {/* All Districts Option */}
          <DropdownMenuItem
            onClick={() => handleCitySelect("")}
            className="px-3 py-2 text-gray-500 dark:text-zinc-400 italic hover:bg-orange/10 dark:hover:bg-orange/20 hover:text-orange rounded-lg cursor-pointer transition duration-150 text-xs sm:text-sm"
          >
            All Districts
          </DropdownMenuItem>
          <DropdownMenuSeparator className="dark:bg-zinc-700 my-1" />
          {/* Direct District List */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district, districtIndex) => (
                <DropdownMenuItem
                  key={districtIndex}
                  onClick={() => handleCitySelect(district)}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition duration-150 ${
                    selectedCity === district
                      ? "bg-orange/10 text-orange font-semibold"
                      : "text-gray-800 dark:text-zinc-200 hover:bg-orange/10 dark:hover:bg-darkSurface hover:text-orange"
                  }`}
                >
                  {district}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-center text-gray-400 dark:text-zinc-500">
                No district found
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CityInput;
