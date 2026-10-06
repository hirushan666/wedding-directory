import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentSuccess from "@/components/stripe/PaymentSuccess";

function PaymentFailedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in rounded-2xl border border-red-100 bg-white p-4 sm:p-8 shadow-sm sm:rounded-3xl dark:border-red-950 dark:bg-darkSurface">
      <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
        <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
        <Skeleton className="h-6 sm:h-7 w-44 sm:w-56" />
        <Skeleton className="h-3.5 sm:h-4 w-60 sm:w-72 max-w-full" />
      </div>
      <div className="mt-3.5 sm:mt-6 space-y-2.5 sm:space-y-4 rounded-xl sm:rounded-2xl border border-red-100 bg-red-50/40 p-3.5 sm:p-5 dark:border-red-950 dark:bg-red-950/20">
        <Skeleton className="h-4 sm:h-5 w-full" />
        <Skeleton className="h-4 sm:h-5 w-3/4" />
      </div>
      <div className="mt-3.5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
        <Skeleton className="h-9 sm:h-11 w-full rounded-xl" />
        <Skeleton className="h-9 sm:h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams?: Promise<{
    order_id?: string | string[];
    service_id?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<PaymentFailedSkeleton />}>
      <PaymentSuccess searchParams={resolvedSearchParams} cancelOnLoad />
    </Suspense>
  );
}
