import React, { useState } from "react";
import { FaStar, FaStarHalf, FaRegStar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

interface OfferingProps {
  name: string;
  vendor: string;
  city: string;
  rating?: number; // make rating optional
  banner: string;
  link: string;
  buttonText: string;
}

const OfferingCard: React.FC<OfferingProps> = ({
  name,
  vendor,
  city,
  rating = 0, // provide default value
  banner,
  link,
  buttonText,
}) => {
  // Generate star rating display
  const renderStars = (rating: number) => {
    const safeRating = Number(rating) || 0; // ensure rating is a number
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" className="text-yellow-400" />);
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-star-${i}`} className="text-yellow-400" />
      );
    }

    return stars;
  };

  // Convert rating to number and handle invalid values
  const numericRating = Number(rating) || 0;

  const [imgSrc, setImgSrc] = useState(banner || "/images/offeringPlaceholder.webp");

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 hover:border-orange/30 transition-all duration-200 overflow-hidden flex flex-col h-full">
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="relative w-full h-48 mb-3 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={imgSrc}
            alt={name}
            className="object-cover transition-transform duration-300 hover:scale-105"
            fill
            priority
            onError={() => setImgSrc("/images/offeringPlaceholder.webp")}
          />
        </div>
        <div className="flex flex-col mb-3 flex-1">
          <h3 className="font-title text-lg font-bold text-gray-900 mb-1 line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center text-sm">{renderStars(numericRating)}</div>
            <span className="text-xs text-gray-500 ml-1">
              ({numericRating.toFixed(1)})
            </span>
          </div>
          <p className="text-gray-700 text-sm font-medium">{vendor}</p>
          <p className="text-gray-400 text-xs mt-0.5">{city}</p>
        </div>
        
        <Link 
          href={link}
          className="mt-auto w-full bg-orange hover:bg-orange/90 text-white py-2.5 px-4 rounded-xl 
                     text-center text-sm font-medium transition-colors shadow-xs"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default OfferingCard;
