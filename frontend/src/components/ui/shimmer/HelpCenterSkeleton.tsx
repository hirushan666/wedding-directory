"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function HelpCenterSkeleton() {
  return (
    <div className="container mx-auto px-4 py-3.5 sm:py-8 max-w-5xl space-y-4 sm:space-y-8 animate-fade-in font-body">
      {/* Hero Skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4 py-4 sm:py-8">
        <Skeleton className="h-6 w-32 mx-auto rounded-full" />
        <Skeleton className="h-10 w-72 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full mx-auto rounded-lg" />
        <div className="pt-4 max-w-xl mx-auto">
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-darkSurface p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3"
          >
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>

      {/* FAQs list */}
      <div className="bg-white dark:bg-darkSurface p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-4">
        <Skeleton className="h-6 w-48 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-6 h-6 rounded-full shrink-0 ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
