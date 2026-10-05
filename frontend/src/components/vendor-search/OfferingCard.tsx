"use client";

import React, { useState, useEffect } from "react";
import { FaStar, FaStarHalf, FaRegStar, FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/VisitorAuthContext";
import { useMutation } from "@apollo/client";
import { ADD_TO_MY_VENDORS, REMOVE_FROM_MY_VENDORS } from "@/graphql/mutations";
import toast from "react-hot-toast";

interface OfferingProps {
  id?: string;
  name: string;
  vendor: string;
  vendorId?: string;
  vendorSlug?: string | null;
  hideVendor?: boolean;
  city: string;
  rating?: number;
  banner: string;
  link: string;
  buttonText: string;
  isSaved?: boolean;
  onToggleSave?: (id: string, isSaved: boolean) => void;
}

const OfferingCard: React.FC<OfferingProps> = ({
  id,
  name,
  vendor,
  vendorId,
  vendorSlug,
  hideVendor = false,
  city,
  rating = 0,
  banner,
  link,
  buttonText,
  isSaved = false,
  onToggleSave,
}) => {
  const { visitor, isAuthenticated } = useAuth();
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSavedState(isSaved);
  }, [isSaved]);

  const [addToMyVendors] = useMutation(ADD_TO_MY_VENDORS);
  const [removeFromMyVendors] = useMutation(REMOVE_FROM_MY_VENDORS);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!visitor?.id) {
      toast.error("Please log in as a visitor to save services");
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      if (isSavedState) {
        await removeFromMyVendors({
          variables: { visitorId: visitor.id, serviceId: id },
        });
        setIsSavedState(false);
        onToggleSave?.(id, false);
        toast.success("Removed from saved services");
      } else {
        await addToMyVendors({
          variables: { visitorId: visitor.id, serviceId: id },
        });
        setIsSavedState(true);
        onToggleSave?.(id, true);
        toast.success("Saved to your shortlisted services!");
      }
    } catch {
      toast.error("Failed to update saved services");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    const safeRating = Number(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`star-${i}`}
          className="text-yellow-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalf
          key="half-star"
          className="text-yellow-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
        />,
      );
    }

    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar
          key={`empty-star-${i}`}
          className="text-yellow-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
        />,
      );
    }

    return stars;
  };

  const numericRating = Number(rating) || 0;
  const [imgSrc, setImgSrc] = useState(
    banner || "/images/offeringPlaceholder.webp",
  );

  return (
    <div className="bg-white dark:bg-darkSurface rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-zinc-800 hover:border-orange/30 dark:hover:border-orange/30 transition-all duration-200 overflow-hidden flex flex-col h-full group">
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <div className="relative w-full h-28 xs:h-32 sm:h-48 mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl bg-gray-100 dark:bg-darkElevated">
          <Image
            src={imgSrc}
            alt={name}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            priority
            onError={() => setImgSrc("/images/offeringPlaceholder.webp")}
          />

          {/* Quick Save / Bookmark Heart Button */}
          {id && isAuthenticated && (
            <button
              type="button"
              onClick={handleSaveToggle}
              disabled={isSaving}
              aria-label={
                isSavedState ? "Remove from saved services" : "Save service"
              }
              title={
                isSavedState
                  ? "Remove from saved services"
                  : "Save to shortlisted services"
              }
              className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                isSavedState
                  ? "bg-white/95 dark:bg-darkSurface/95 text-red-500 scale-105"
                  : "bg-black/35 hover:bg-black/60 text-white hover:text-red-400 hover:scale-110"
              }`}
            >
              {isSavedState ? (
                <FaHeart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
              ) : (
                <FiHeart className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col mb-2 sm:mb-3 flex-1">
          <Link
            href={link}
            className="font-title text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-zinc-100 mb-0.5 sm:mb-1 line-clamp-1 hover:text-orange transition-colors leading-tight"
          >
            {name}
          </Link>
          <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
            <div className="flex items-center">
              {renderStars(numericRating)}
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400 ml-0.5 font-body">
              ({numericRating.toFixed(1)})
            </span>
          </div>
          {!hideVendor && (
            (vendorId || vendorSlug) ? (
              <Link
                href={`/vendors/${vendorSlug || vendorId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gray-700 dark:text-zinc-300 text-[11px] sm:text-sm font-medium font-body truncate hover:text-orange dark:hover:text-orange transition-colors underline-offset-2 hover:underline leading-tight"
              >
                {vendor}
              </Link>
            ) : (
              <p className="text-gray-700 dark:text-zinc-300 text-[11px] sm:text-sm font-medium font-body truncate leading-tight">
                {vendor}
              </p>
            )
          )}
          <p className="text-gray-400 dark:text-zinc-500 text-[10px] sm:text-xs mt-0.5 font-body truncate leading-tight">
            {city}
          </p>
        </div>

        <Link
          href={link}
          className="mt-auto w-full bg-orange hover:bg-orange/90 text-white py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl text-center text-[11px] sm:text-sm font-semibold transition-all shadow-xs font-body active:scale-[0.99]"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default OfferingCard;
