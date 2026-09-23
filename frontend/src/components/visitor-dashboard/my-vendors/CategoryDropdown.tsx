import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  FiHome,
  FiScissors,
  FiCoffee,
  FiCamera,
  FiVideo,
  FiAward,
  FiSmile,
  FiGift,
  FiMail,
  FiMusic,
  FiTruck,
  FiGlobe,
  FiSun,
  FiFeather,
  FiTag,
  FiBookmark,
  FiSearch,
  FiArrowRight,
  FiX,
  FiExternalLink,
} from 'react-icons/fi';
import VendorCard from '@/components/visitor-dashboard/my-vendors/VendorCard';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Venues':
      return FiHome;
    case 'Suits and Dresses':
      return FiScissors;
    case 'Catering':
      return FiCoffee;
    case 'Photographers':
      return FiCamera;
    case 'Videographers':
      return FiVideo;
    case 'Jewelery':
      return FiAward;
    case 'Hair and Makeup':
      return FiSmile;
    case 'Cakes':
      return FiGift;
    case 'Invitations':
      return FiMail;
    case 'Music':
      return FiMusic;
    case 'Transportation':
      return FiTruck;
    case 'Travel Agents':
      return FiGlobe;
    case 'Florists':
      return FiSun;
    case 'Resin Artists':
      return FiFeather;
    default:
      return FiTag;
  }
};

export const getCategoryDescription = (category: string) => {
  switch (category) {
    case 'Venues':
      return 'Banquet halls, castles, lawns & reception spaces';
    case 'Suits and Dresses':
      return 'Bridal gowns, groom suits, tuxedos & attire';
    case 'Catering':
      return 'Buffets, custom menus, drinks & wedding dinners';
    case 'Photographers':
      return 'Portraits, candid shoots & timeless wedding memories';
    case 'Videographers':
      return 'Cinematic wedding highlight reels & teasers';
    case 'Jewelery':
      return 'Wedding rings, accessories & fine jewelry';
    case 'Hair and Makeup':
      return 'Bridal glow, makeup artists, styling & salon';
    case 'Cakes':
      return 'Bespoke multi-tier wedding cakes & desserts';
    case 'Invitations':
      return 'Custom stationery, wedding cards & e-invites';
    case 'Music':
      return 'Live wedding bands, DJs, acoustic artists & sound';
    case 'Transportation':
      return 'Luxury limousines, classic vintage cars & shuttles';
    case 'Travel Agents':
      return 'Honeymoon packages, exotic destinations & flights';
    case 'Florists':
      return 'Bouquets, floral arches, centerpieces & decor';
    case 'Resin Artists':
      return 'Preserved flower art, personalized keepsakes & gifts';
    default:
      return 'Explore top-rated wedding services';
  }
};

export interface CategoryCardProps {
  category: string;
  vendorCount: number;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  vendorCount,
  onClick,
}) => {
  const IconComponent = getCategoryIcon(category);
  const description = getCategoryDescription(category);
  const hasVendors = vendorCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full text-left rounded-2xl border-2 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange/30 cursor-pointer ${
        hasVendors
          ? 'bg-orange/[0.03] dark:bg-darkElevated/60 border-orange/35 dark:border-orange/30 hover:border-orange dark:hover:border-orange shadow-xs'
          : 'bg-white dark:bg-darkSurface border-orange/20 dark:border-zinc-800 hover:border-orange dark:hover:border-orange shadow-2xs'
      }`}
    >
      <div>
        {/* Top Row: Icon + Badge */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              hasVendors
                ? 'bg-orange/15 dark:bg-orange/20 text-orange shadow-2xs'
                : 'bg-orange/[0.08] dark:bg-darkElevated text-orange/80 group-hover:bg-orange/15 group-hover:text-orange'
            }`}
          >
            <IconComponent size={22} />
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
              hasVendors
                ? 'bg-orange text-white shadow-2xs'
                : 'bg-gray-100 dark:bg-darkElevated text-gray-500 dark:text-zinc-400 group-hover:bg-orange/10 group-hover:text-orange'
            }`}
          >
            {hasVendors ? `${vendorCount} ${vendorCount === 1 ? 'Vendor' : 'Vendors'}` : '0 Saved'}
          </span>
        </div>

        {/* Middle: Title & Description */}
        <h3 className="font-title text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange dark:group-hover:text-orange transition-colors mt-4 mb-1.5">
          {category}
        </h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom Row: Callout link */}
      <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-orange/15 dark:border-zinc-800 text-xs font-semibold">
        <span
          className={`transition-colors ${
            hasVendors ? 'text-orange font-bold' : 'text-gray-500 dark:text-zinc-400 group-hover:text-orange'
          }`}
        >
          {hasVendors ? 'View Shortlisted' : 'Explore Category'}
        </span>
        <div className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center group-hover:bg-orange group-hover:text-white group-hover:translate-x-1 transition-all">
          <FiArrowRight size={13} />
        </div>
      </div>
    </button>
  );
};

export interface ServiceVendorData {
  id: string;
  name: string;
  category: string;
  banner: string;
  vendor: {
    busname: string;
    city: string;
  };
}

export interface OfferingVendorItem {
  id: string;
  service?: ServiceVendorData;
  offering?: ServiceVendorData;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string | null;
  vendors: OfferingVendorItem[];
  loading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  vendors,
  loading = false,
}) => {
  // Close on ESC key and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;

  const IconComponent = getCategoryIcon(category);
  const offeringsInCategory = vendors.filter(
    (myVendor) => (myVendor.service || myVendor.offering)?.category === category
  );
  const hasOfferings = offeringsInCategory.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl shadow-2xl border border-orange/20 dark:border-zinc-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-orange/10 dark:border-zinc-800 bg-orange/[0.03] dark:bg-darkElevated/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-orange/15 dark:bg-orange/20 text-orange flex items-center justify-center shrink-0 shadow-2xs">
              <IconComponent size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-title text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100 truncate">
                  {category}
                </h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    hasOfferings
                      ? 'bg-orange/15 text-orange'
                      : 'bg-gray-100 dark:bg-darkElevated text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {offeringsInCategory.length} Saved
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-body mt-0.5">
                {hasOfferings
                  ? `Your shortlisted vendors for ${category.toLowerCase()}`
                  : `No shortlisted vendors saved yet`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-orange hover:border-orange/30 hover:bg-orange/10 flex items-center justify-center transition-all shrink-0 ml-2 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-orange/[0.01] dark:bg-darkBg/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-orange">
              <div className="w-6 h-6 rounded-full border-2 border-orange border-t-transparent animate-spin" />
              <span className="text-sm font-semibold">Loading vendors...</span>
            </div>
          ) : hasOfferings ? (
            <div className="space-y-3">
              {offeringsInCategory.map((myVendor) => {
                const svc = myVendor.service || myVendor.offering!;
                return (
                  <VendorCard
                    key={svc.id}
                    name={svc.name}
                    vendor={svc.vendor?.busname || 'Vendor name not available'}
                    city={svc.vendor?.city || 'Location not available'}
                    banner={svc.banner || '/images/bride.webp'}
                    link={`/services/${svc.id}`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-white dark:bg-darkElevated/30 rounded-2xl border border-dashed border-orange/25 dark:border-zinc-800 my-2">
              <div className="w-14 h-14 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-3.5">
                <FiBookmark size={24} />
              </div>
              <h3 className="font-title text-lg font-bold text-gray-900 dark:text-zinc-100">
                No saved vendors in {category}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-5 max-w-sm mx-auto">
                You haven&apos;t shortlisted any {category.toLowerCase()} vendors yet. Browse our directory to find the perfect vendor!
              </p>
              <Link
                href={`/services?category=${encodeURIComponent(category)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-orange hover:bg-orange/90 transition-all shadow-xs"
                onClick={onClose}
              >
                <span>Browse {category} Services</span>
                <FiSearch size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-orange/10 dark:border-zinc-800 bg-white dark:bg-darkSurface flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/services?category=${encodeURIComponent(category)}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange hover:underline"
          >
            <FiSearch size={13} />
            <span>Search all {category} in directory</span>
            <FiExternalLink size={12} />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-darkElevated hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;