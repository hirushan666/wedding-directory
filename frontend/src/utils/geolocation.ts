import cities from "./city.json";

export const SRI_LANKA_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
] as const;

export type SriLankaDistrict = (typeof SRI_LANKA_DISTRICTS)[number];

// Pre-index city to district mappings for rapid O(1) matching
const townToDistrictMap = new Map<string, string>();
const districtLookupMap = new Map<string, string>();

for (const d of SRI_LANKA_DISTRICTS) {
  districtLookupMap.set(d.toLowerCase(), d);
}

for (const item of cities) {
  if (item.City && item.District) {
    townToDistrictMap.set(item.City.toLowerCase().trim(), item.District);
  }
}

/**
 * Matches any raw string (district, town, province, or admin area) to one of Sri Lanka's 25 official districts.
 */
export function matchSriLankaDistrict(candidate?: string | null): string | null {
  if (!candidate || typeof candidate !== "string") return null;

  const raw = candidate.trim().toLowerCase();
  if (!raw) return null;

  // Direct exact match
  if (districtLookupMap.has(raw)) {
    return districtLookupMap.get(raw)!;
  }

  // Remove common suffixes like " district", " province", etc.
  const cleaned = raw
    .replace(/\bdistrict\b/gi, "")
    .replace(/\bprovince\b/gi, "")
    .trim();

  if (districtLookupMap.has(cleaned)) {
    return districtLookupMap.get(cleaned)!;
  }

  // Check if any official district name is contained in the string
  for (const [lowerD, officialD] of districtLookupMap.entries()) {
    if (raw.includes(lowerD) || cleaned.includes(lowerD)) {
      return officialD;
    }
  }

  // Check if it's a known town in city.json
  if (townToDistrictMap.has(raw)) {
    return townToDistrictMap.get(raw)!;
  }
  if (townToDistrictMap.has(cleaned)) {
    return townToDistrictMap.get(cleaned)!;
  }

  // Partial town match
  for (const [townLower, district] of townToDistrictMap.entries()) {
    if (raw.includes(townLower) || townLower.includes(raw)) {
      return district;
    }
  }

  return null;
}

/**
 * Checks whether coordinates fall roughly inside the Sri Lanka territorial bounding box.
 */
export function isWithinSriLanka(lat: number, lng: number): boolean {
  return lat >= 5.8 && lat <= 9.9 && lng >= 79.5 && lng <= 82.1;
}

/**
 * Reverse geocodes coordinates to a Sri Lankan district using Nominatim with fallback to BigDataCloud.
 */
export async function reverseGeocodeToDistrict(
  lat: number,
  lng: number,
): Promise<string | null> {
  if (!isWithinSriLanka(lat, lng)) {
    return null;
  }

  // Attempt 1: OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const candidates = [
        addr.state_district,
        addr.county,
        addr.state,
        addr.city,
        addr.town,
        addr.suburb,
        addr.village,
        addr.municipality,
      ];

      for (const candidate of candidates) {
        const matched = matchSriLankaDistrict(candidate);
        if (matched) return matched;
      }
    }
  } catch (err) {
    // Nominatim failed or timed out, proceed to fallback
  }

  // Attempt 2: BigDataCloud client reverse geocoding API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      {
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const candidates: (string | undefined)[] = [
        data.principalSubdivision,
        data.locality,
        data.city,
      ];

      if (Array.isArray(data.localityInfo?.administrative)) {
        for (const item of data.localityInfo.administrative) {
          if (item?.name) candidates.push(item.name);
        }
      }

      for (const candidate of candidates) {
        const matched = matchSriLankaDistrict(candidate);
        if (matched) return matched;
      }
    }
  } catch (err) {
    // BigDataCloud failed or timed out
  }

  return null;
}

/**
 * Requests browser location (if permitted) and returns the matching Sri Lankan district name, or null.
 */
export async function detectUserDistrict(): Promise<string | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return null;
  }

  return new Promise<string | null>((resolve) => {
    let resolved = false;

    // Safety timeout in case browser prompt hangs or is ignored
    const safetyTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimeout);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const district = await reverseGeocodeToDistrict(lat, lng);
          resolve(district);
        } catch {
          resolve(null);
        }
      },
      (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimeout);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 1000 * 60 * 60, // 1 hour cache allowed
      },
    );
  });
}
