import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const OfferingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-darkSurface rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col h-full">
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        {/* Banner image skeleton */}
        <Skeleton className="w-full h-28 xs:h-32 sm:h-48 mb-2 sm:mb-3 rounded-lg sm:rounded-xl" />

        <div className="flex flex-col mb-2 sm:mb-3 flex-1 space-y-1.5 sm:space-y-2">
          {/* Title skeleton */}
          <Skeleton className="h-4 sm:h-6 w-3/4 rounded-md sm:rounded-lg" />

          {/* Rating stars skeleton */}
          <div className="flex items-center gap-1 sm:gap-1.5 py-0.5">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 rounded" />
            <Skeleton className="h-3 sm:h-3.5 w-6 sm:w-8 rounded" />
          </div>

          {/* Vendor name skeleton */}
          <Skeleton className="h-3 sm:h-4 w-1/2 rounded" />

          {/* City skeleton */}
          <Skeleton className="h-2.5 sm:h-3.5 w-1/3 rounded" />
        </div>

        {/* Action button skeleton */}
        <Skeleton className="mt-auto h-7 sm:h-10 w-full rounded-lg sm:rounded-xl" />
      </div>
    </div>
  );
};

interface OfferingGridSkeletonProps {
  count?: number;
}

export const OfferingGridSkeleton: React.FC<OfferingGridSkeletonProps> = ({
  count = 8,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <OfferingCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default OfferingCardSkeleton;
