'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { FiMapPin, FiLoader, FiX } from 'react-icons/fi';
import cities from '@/utils/city.json';
import { cn } from '@/lib/utils';

export interface LocationSearchResult {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (result: LocationSearchResult) => void;
  district?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Match town/place to Sri Lanka's 25 official districts
const matchDistrict = (rawName?: string): string => {
  if (!rawName) return '';
  const clean = rawName.toLowerCase().trim();

  // 1. Direct district match
  const foundDistrict = cities.find(
    (c) => c.District.toLowerCase() === clean || clean.includes(c.District.toLowerCase())
  );
  if (foundDistrict) return foundDistrict.District;

  // 2. City / town match to parent district
  const foundCity = cities.find(
    (c) => c.City.toLowerCase() === clean || clean.includes(c.City.toLowerCase())
  );
  if (foundCity) return foundCity.District;

  return '';
};

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  value,
  onChange,
  onLocationSelect,
  district,
  placeholder = 'Search street, landmark, venue, or hotel...',
  className = '',
  disabled = false,
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Check vertical space to flip dropdown upwards if near bottom of viewport
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 230 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen, suggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = useCallback(
    async (text: string) => {
      if (!text || text.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        // Query Photon (fuzzy OpenStreetMap geocoder)
        // If a district is already chosen, append district to search if not already present to bias results
        const searchQuery = district && !text.toLowerCase().includes(district.toLowerCase())
          ? `${text.trim()}, ${district.trim()}`
          : text.trim();

        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          searchQuery
        )}&lat=7.8731&lon=80.7718&limit=7`;

        const res = await fetch(photonUrl);
        let items: any[] = [];
        if (res.ok) {
          const json = await res.json();
          items = (json.features || []).filter(
            (f: any) => !f.properties?.countrycode || f.properties?.countrycode === 'LK'
          );
        }

        // If Photon returns 0 results for the combined query, try the raw query
        if (items.length === 0 && searchQuery !== text.trim()) {
          const rawUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
            text.trim()
          )}&lat=7.8731&lon=80.7718&limit=6`;
          const rawRes = await fetch(rawUrl);
          if (rawRes.ok) {
            const rawJson = await rawRes.json();
            items = (rawJson.features || []).filter(
              (f: any) => !f.properties?.countrycode || f.properties?.countrycode === 'LK'
            );
          }
        }

        // If still no results, fallback to Nominatim Sri Lanka
        if (items.length === 0) {
          const qWithCountry = text.trim().toLowerCase().includes('sri lanka')
            ? text.trim()
            : `${text.trim()}, Sri Lanka`;

          const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            qWithCountry
          )}&format=geojson&limit=5&countrycodes=lk`;

          const nomRes = await fetch(nomUrl, {
            headers: { 'Accept-Language': 'en' },
          });
          if (nomRes.ok) {
            const nomJson = await nomRes.json();
            items = nomJson.features || [];
          }
        }

        setSuggestions(items);
        setIsOpen(items.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.warn('Location autocomplete search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [district]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      searchLocations(val);
    }, 280);
  };

  const handleSelect = (feature: any) => {
    const coords = feature.geometry?.coordinates; // [lng, lat]
    if (!coords || coords.length < 2) return;

    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    const props = feature.properties || {};

    const name = props.name || props.display_name?.split(',')[0] || '';
    const locality = props.street || props.locality || props.city || props.town || props.village || '';
    const county = props.county || props.district || props.state || '';
    const fullAddress = props.display_name || [name, locality, county].filter(Boolean).join(', ');

    setQuery(fullAddress);
    onChange(fullAddress);
    setIsOpen(false);
    setSuggestions([]);

    const detectedDistrict =
      matchDistrict(props.county) ||
      matchDistrict(props.district) ||
      matchDistrict(props.city) ||
      matchDistrict(props.town) ||
      matchDistrict(locality) ||
      matchDistrict(name) ||
      matchDistrict(props.display_name);

    if (onLocationSelect) {
      onLocationSelect({
        address: fullAddress,
        city: detectedDistrict,
        lat,
        lng,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative w-full">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-11 w-full px-3.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated text-gray-900 dark:text-zinc-100 rounded-xl text-sm font-normal placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange hover:border-orange/60 transition-colors pr-9',
            className
          )}
        />
        {isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <FiLoader className="w-3.5 h-3.5 text-orange animate-spin" />
          </div>
        )}
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          className={cn(
            'absolute left-0 w-full bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 text-xs animate-in fade-in duration-100 font-body',
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          )}
        >
          {suggestions.map((item, index) => {
            const props = item.properties || {};
            const title = props.name || props.display_name?.split(',')[0] || 'Location';
            const subtitle =
              props.display_name ||
              [props.street, props.city || props.town || props.locality, props.county || props.district]
                .filter(Boolean)
                .join(', ');

            const isSelected = selectedIndex === index;

            return (
              <li
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className={`p-3 cursor-pointer transition-colors flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-orange/15 text-orange dark:bg-orange/20'
                    : 'hover:bg-orange/10 dark:hover:bg-darkElevated hover:text-orange text-gray-800 dark:text-zinc-200'
                }`}
              >
                <FiMapPin className="text-orange shrink-0 mt-0.5 text-sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                    {title}
                  </span>
                  {subtitle && subtitle !== title && (
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                      {subtitle}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchInput;
