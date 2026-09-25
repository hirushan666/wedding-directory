'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiMapPin, FiSearch, FiCrosshair, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import cities from '@/utils/city.json';

interface LocationResult {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: LocationResult) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  initialCity?: string;
  title?: string;
}

// Sri Lanka fallback center
const DEFAULT_CENTER = {
  lat: 6.9271,
  lng: 79.8612, // Colombo
};

// Helper: Match a resolved city/district name against local city.json
const matchSriLankaCity = (rawName?: string): string => {
  if (!rawName) return '';
  const clean = rawName.toLowerCase().trim();

  // 1. Direct city match
  const foundCity = cities.find(
    (c) => c.City.toLowerCase() === clean || clean.includes(c.City.toLowerCase())
  );
  if (foundCity) return foundCity.City;

  // 2. District match
  const foundDistrict = cities.find(
    (c) => c.District.toLowerCase() === clean || clean.includes(c.District.toLowerCase())
  );
  if (foundDistrict) return foundDistrict.City;

  return rawName.split(',')[0].trim();
};

// Dynamic Leaflet Map Component (Client-only)
const LeafletMapPicker = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      const { MapContainer, TileLayer, Marker, useMapEvents } = mod;

      return function InnerMap({
        position,
        onPositionChange,
      }: {
        position: [number, number];
        onPositionChange: (pos: [number, number]) => void;
      }) {
        const [icon, setIcon] = useState<any>(null);

        useEffect(() => {
          import('leaflet').then((L) => {
            // Custom Orange Marker Pin for Say I Do
            const customIcon = L.divIcon({
              className: 'custom-map-marker',
              html: `
                <div style="
                  position: relative;
                  width: 34px;
                  height: 34px;
                  background-color: #f97316;
                  border: 3px solid #ffffff;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <div style="
                    width: 12px;
                    height: 12px;
                    background-color: #ffffff;
                    border-radius: 50%;
                    transform: rotate(45deg);
                  "></div>
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 34],
            });
            setIcon(customIcon);
          });
        }, []);

        // Listen for map clicks to move the pin
        function MapClickHandler() {
          useMapEvents({
            click(e) {
              onPositionChange([e.latlng.lat, e.latlng.lng]);
            },
          });
          return null;
        }

        if (!icon) {
          return <Skeleton className="w-full h-full min-h-[380px] rounded-xl" />;
        }

        return (
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', minHeight: '380px', zIndex: 0 }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={position}
              icon={icon}
              draggable={true}
              eventHandlers={{
                dragend: (e: any) => {
                  const latlng = e.target.getLatLng();
                  onPositionChange([latlng.lat, latlng.lng]);
                },
              }}
            />
            <MapClickHandler />
          </MapContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[380px] rounded-xl" />,
  }
);

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialAddress = '',
  initialCity = '',
  title = 'Pin Service Location',
}) => {
  const [position, setPosition] = useState<[number, number]>([
    initialLat || DEFAULT_CENTER.lat,
    initialLng || DEFAULT_CENTER.lng,
  ]);
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial position when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setPosition([initialLat, initialLng]);
      }
      setAddress(initialAddress);
      setCity(initialCity);
    }
  }, [isOpen, initialLat, initialLng, initialAddress, initialCity]);

  // Reverse geocode when position changes
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const displayName = data.display_name || '';
        const addrObj = data.address || {};
        const detectedCity =
          addrObj.city ||
          addrObj.town ||
          addrObj.suburb ||
          addrObj.village ||
          addrObj.county ||
          addrObj.state_district ||
          '';

        const matchedCity = matchSriLankaCity(detectedCity);

        // Build a concise clean address
        const road = addrObj.road || addrObj.suburb || '';
        const shortAddress = road
          ? `${road}, ${matchedCity || detectedCity}`
          : displayName.split(',').slice(0, 3).join(', ');

        setAddress(shortAddress || displayName);
        if (matchedCity) {
          setCity(matchedCity);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const handlePositionChange = (newPos: [number, number]) => {
    setPosition(newPos);
    reverseGeocode(newPos[0], newPos[1]);
  };

  // Autocomplete search using Photon (free fuzzy OpenStreetMap search)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Bias search towards Sri Lanka center coordinates
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query.trim()
        )}&lat=7.8731&lon=80.7718&limit=5`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          // Filter to LK if countrycode exists, or take top results
          const lkFeatures = (json.features || []).filter(
            (f: any) => !f.properties.countrycode || f.properties.countrycode === 'LK'
          );
          setSearchResults(lkFeatures.length > 0 ? lkFeatures : json.features || []);
        }
      } catch (err) {
        console.warn('Photon search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchResult = (feature: any) => {
    const coords = feature.geometry.coordinates; // [lng, lat]
    const lng = coords[0];
    const lat = coords[1];
    const props = feature.properties;
    const name = props.name || '';
    const cityProp = props.city || props.district || props.state || '';
    const fullAddr = [name, cityProp, 'Sri Lanka'].filter(Boolean).join(', ');

    setPosition([lat, lng]);
    setAddress(fullAddr);
    if (cityProp) {
      setCity(matchSriLankaCity(cityProp));
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  // Browser current location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onConfirm({
      address: address.trim(),
      city: city.trim(),
      lat: position[0],
      lng: position[1],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden font-body animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
              <FiMapPin className="text-base" />
            </div>
            <div>
              <h3 className="font-title font-bold text-base text-gray-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Click or drag the pin anywhere on the map to set the exact spot
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-darkElevated transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Search & Location Bar */}
        <div className="p-3 bg-gray-50/70 dark:bg-darkElevated/50 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2 relative">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search area, landmark or hotel (e.g. Mount Lavinia, Galle Fort)..."
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-white dark:bg-darkSurface border-gray-200 dark:border-zinc-700"
            />
            {isSearching && (
              <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 text-orange text-xs animate-spin" />
            )}

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <ul className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-darkSurface border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                {searchResults.map((item, index) => {
                  const props = item.properties;
                  const label = [props.name, props.city, props.district].filter(Boolean).join(', ');
                  return (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectSearchResult(item)}
                      className="p-2.5 hover:bg-orange/10 dark:hover:bg-darkElevated hover:text-orange cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <FiMapPin className="text-orange shrink-0 text-xs" />
                      <span className="truncate">{label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="h-9 px-3 text-xs rounded-xl border-gray-200 dark:border-zinc-700 flex items-center gap-1.5 shrink-0 bg-white dark:bg-darkSurface text-gray-700 dark:text-zinc-200 hover:border-orange hover:text-orange"
          >
            <FiCrosshair className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </Button>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 w-full h-[380px] sm:h-[420px] relative bg-gray-100 dark:bg-darkElevated">
          <LeafletMapPicker position={position} onPositionChange={handlePositionChange} />
          {isReverseGeocoding && (
            <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-darkSurface/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-700 dark:text-zinc-200 shadow-md border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
              <FiLoader className="animate-spin text-orange" />
              <span>Fetching address...</span>
            </div>
          )}
        </div>

        {/* Selected Details & Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange">
                Pinned Address:
              </span>
              {city && (
                <span className="text-[11px] font-semibold bg-orange/10 text-orange px-2 py-0.5 rounded-md">
                  {city}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-800 dark:text-zinc-200 truncate mt-0.5 font-medium">
              {address || 'Move or click the pin to select location'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs h-9 px-4 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              className="rounded-xl text-xs h-9 px-4 bg-orange hover:bg-orange/90 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <FiCheck className="text-sm" />
              <span>Confirm Location</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
