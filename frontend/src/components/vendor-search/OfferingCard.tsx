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
  city,
  rating = 0,
  banner,
  link,
  buttonText,
  isSaved = false,
  onToggleSave,
}) => {
  const { visitor } = useAuth();
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
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" className="text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-star-${i}`} className="text-yellow-400" />
      );
    }

    return stars;
  };

  const numericRating = Number(rating) || 0;
  const [imgSrc, setImgSrc] = useState(banner || "/images/offeringPlaceholder.webp");

  return (
    <div className="bg-white dark:bg-darkSurface rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-zinc-800 hover:border-orange/30 dark:hover:border-orange/30 transition-all duration-200 overflow-hidden flex flex-col h-full group">
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="relative w-full h-48 mb-3 overflow-hidden rounded-xl bg-gray-100 dark:bg-darkElevated">
          <Image
            src={imgSrc}
            alt={name}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            priority
            onError={() => setImgSrc("/images/offeringPlaceholder.webp")}
          />

          {/* Quick Save / Bookmark Heart Button */}
          {id && (
            <button
              type="button"
              onClick={handleSaveToggle}
              disabled={isSaving}
              aria-label={isSavedState ? "Remove from saved services" : "Save service"}
              title={isSavedState ? "Remove from saved services" : "Save to shortlisted services"}
              className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                isSavedState
                  ? "bg-white/95 dark:bg-darkSurface/95 text-red-500 scale-105"
                  : "bg-black/35 hover:bg-black/60 text-white hover:text-red-400 hover:scale-110"
              }`}
            >
              {isSavedState ? (
                <FaHeart className="w-4 h-4 text-red-500 fill-red-500" />
              ) : (
                <FiHeart className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col mb-3 flex-1">
          <h3 className="font-title text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1 line-clamp-1 group-hover:text-orange transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center text-sm">{renderStars(numericRating)}</div>
            <span className="text-xs text-gray-500 dark:text-zinc-400 ml-1 font-body">
              ({numericRating.toFixed(1)})
            </span>
          </div>
          <p className="text-gray-700 dark:text-zinc-300 text-sm font-medium font-body truncate">
            {vendor}
          </p>
          <p className="text-gray-400 dark:text-zinc-500 text-xs mt-0.5 font-body">
            {city}
          </p>
        </div>

        <Link
          href={link}
          className="mt-auto w-full bg-orange hover:bg-orange/90 text-white py-2.5 px-4 rounded-xl text-center text-sm font-semibold transition-all shadow-xs font-body active:scale-[0.99]"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default OfferingCard;
