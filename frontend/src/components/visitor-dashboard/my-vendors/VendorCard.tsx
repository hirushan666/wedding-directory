import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMapPin, FiExternalLink } from "react-icons/fi";

interface VendorCardProps {
  name: string;
  vendor: string;
  city: string;
  banner: string;
  link: string;
}

const VendorCard = ({ name, vendor, city, banner, link }: VendorCardProps) => {
  const [imgSrc, setImgSrc] = React.useState(banner || "/images/offeringPlaceholder.webp");

  React.useEffect(() => {
    setImgSrc(banner || "/images/offeringPlaceholder.webp");
  }, [banner]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border-2 border-orange/20 dark:border-zinc-800 hover:border-orange dark:hover:border-orange bg-white dark:bg-darkSurface shadow-xs hover:shadow-md transition-all group w-full">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-xl bg-orange/5 dark:bg-darkElevated border border-orange/10 dark:border-zinc-800">
          <Image
            src={imgSrc}
            alt={`${name} banner`}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            fill
            sizes="(max-width: 96px) 100vw, 96px"
            onError={() => setImgSrc("/images/offeringPlaceholder.webp")}
          />
        </div>

        <div className="flex-grow min-w-0">
          <span className="inline-block text-xs font-bold text-orange uppercase tracking-wider mb-0.5">
            {vendor}
          </span>
          <h3 className="font-title text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 group-hover:text-orange dark:group-hover:text-orange transition-colors truncate">
            {name}
          </h3>
          <p className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            <FiMapPin className="text-orange shrink-0" size={13} />
            <span className="truncate">{city}</span>
          </p>
        </div>
      </div>

      <Link
        href={link}
        className="self-end sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-orange hover:bg-orange/90 shadow-xs transition-all flex-shrink-0"
      >
        <span>View Details</span>
        <FiExternalLink size={14} />
      </Link>
    </div>
  );
};

export default VendorCard;