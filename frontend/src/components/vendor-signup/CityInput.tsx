'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import cities from '../../utils/city.json';
import { ChevronDown, Search } from "lucide-react";
import { CityProps } from "@/types/signupInput";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

const CityInput: React.FC<CityProps> = ({ onCityChange, placeholder, className, value }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(value || null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (value !== undefined) {
      setSelectedCity(value || null);
    }
  }, [value]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    onCityChange(city);
    setSearchTerm("");
  };

  // Distinct sorted list of Sri Lanka's 25 districts
  const districts = useMemo(() => {
    return [...new Set(cities.map((city) => city.District))].sort();
  }, []);

  const filteredDistricts = useMemo(() => {
    if (!searchTerm.trim()) return districts;
    const q = searchTerm.toLowerCase().trim();
    return districts.filter((d) => d.toLowerCase().includes(q));
  }, [districts, searchTerm]);

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex flex-row justify-between items-center text-left w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-900 dark:text-zinc-100 font-normal focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange hover:border-orange/60 transition-colors cursor-pointer text-sm",
              className
            )}
          >
            <span className={`truncate ${!selectedCity ? "text-gray-400 dark:text-zinc-500" : ""}`}>
              {selectedCity ? selectedCity : (placeholder || "Select District")}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-400 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-700 shadow-2xl rounded-xl font-body z-50 p-1.5">
          {/* Quick Search */}
          <div className="p-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
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
          {/* Direct District List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleCitySelect(district)}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    selectedCity === district
                      ? "bg-orange/10 text-orange font-semibold"
                      : "text-gray-800 dark:text-zinc-200 hover:bg-orange/10 hover:text-orange dark:hover:bg-darkSurface"
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
