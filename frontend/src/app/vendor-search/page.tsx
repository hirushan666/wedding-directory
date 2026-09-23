"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OfferingGridSkeleton } from "@/components/ui/shimmer";

function VendorSearchRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `/services?${qs}` : "/services");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg p-8 max-w-7xl mx-auto pt-24">
      <OfferingGridSkeleton count={8} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-lightYellow dark:bg-darkBg p-8 max-w-7xl mx-auto pt-24">
          <OfferingGridSkeleton count={8} />
        </div>
      }
    >
      <VendorSearchRedirect />
    </Suspense>
  );
}
