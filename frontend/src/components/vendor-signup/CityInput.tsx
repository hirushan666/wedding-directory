'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import cities from '../../utils/city.json';
import { ChevronDown } from "lucide-react";
import { CityProps } from "@/types/signupInput";
import { useState, useEffect } from "react";

const CityInput: React.FC<CityProps> = ({ onCityChange, placeholder, className, value }) => {

  const [selectedCity, setSelectedCity] = useState<string | null>(value || null); // State to store selected city

  useEffect(() => {
    if (value !== undefined) {
      setSelectedCity(value || null);
    }
  }, [value]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city); // Update the selected city
    onCityChange(city); // Call the parent handler
  };

  const provinces = [...new Set(cities.map(city => city.Province))];

  const getDistrictsByProvince = (province: string) => {
    const districts = [...new Set(
      cities
        .filter(city => city.Province === province)
        .map(city => city.District)
    )];
    return districts;
  };

  const getCitiesByDistrict = (district: string) => {
    const citiesByDistrict = cities
      .filter(city => city.District === district)
      .map(city => city.City);
    return citiesByDistrict;
  };

  return (
    <div className={className || "border-black border-solid border-2 rounded-lg flex flex-row space-y-1.5 bg-white dark:bg-darkElevated"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex flex-row justify-between items-center text-left w-full text-gray-800 dark:text-zinc-100 hover:bg-transparent bg-transparent h-full px-3 font-normal focus:outline-none focus:ring-0 cursor-pointer text-sm"
          >
            <span className="truncate">{selectedCity ? selectedCity : placeholder}</span>
            <ChevronDown className="ml-1 h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 shadow-xl rounded-xl max-h-60 overflow-y-auto font-body z-50">
          <DropdownMenuLabel className="font-body px-3 py-2 text-gray-500 dark:text-zinc-400 text-xs">
            Find Your City
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="dark:bg-zinc-700" />
          <DropdownMenuGroup>
            {/* Provinces */}
            {provinces.map((province, provinceIndex) => (
              <DropdownMenuSub key={provinceIndex}>
                <DropdownMenuSubTrigger className="px-3 py-2 text-gray-800 dark:text-zinc-200 hover:bg-orange/10 dark:hover:bg-darkSurface rounded-lg cursor-pointer transition duration-150 text-sm">
                  {province}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 shadow-xl rounded-xl max-h-60 overflow-y-auto font-body z-50">
                    {/* Districts */}
                    {getDistrictsByProvince(province).map((district, districtIndex) => (
                      <DropdownMenuSub key={districtIndex}>
                        <DropdownMenuSubTrigger className="px-3 py-2 text-gray-800 dark:text-zinc-200 hover:bg-orange/10 dark:hover:bg-darkSurface rounded-lg cursor-pointer transition duration-150 text-sm">
                          {district}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="bg-white dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 shadow-xl rounded-xl max-h-60 overflow-y-auto font-body z-50">
                            {/* Cities */}
                            {getCitiesByDistrict(district).map((city, cityIndex) => (
                              <DropdownMenuItem
                                key={cityIndex}
                                onClick={() => handleCitySelect(city)}
                                className="px-3 py-2 text-gray-800 dark:text-zinc-200 hover:bg-orange/10 dark:hover:bg-darkSurface rounded-lg cursor-pointer transition duration-150 text-sm"
                              >
                                {city}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="dark:bg-zinc-700" />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CityInput;
