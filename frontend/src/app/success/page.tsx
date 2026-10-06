import PaymentSuccess from '@/components/stripe/PaymentSuccess';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PaymentSuccessSkeleton() {
  return (
    <div className="w-full flex items-center justify-center py-2 sm:py-6 font-body">
      <div className="bg-white dark:bg-darkSurface rounded-2xl sm:rounded-3xl border border-orange/15 dark:border-zinc-800 shadow-xl max-w-lg w-full p-4 sm:p-8 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col items-center space-y-2 sm:space-y-3 text-center">
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full" />
          <Skeleton className="h-6 sm:h-7 w-40 sm:w-48" />
          <Skeleton className="h-3.5 sm:h-4 w-56 sm:w-64 max-w-full" />
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24 sm:w-28" />
            <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
          </div>
          <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
            <Skeleton className="h-3.5 sm:h-4 w-3/4" />
            <Skeleton className="h-3.5 sm:h-4 w-1/2" />
            <Skeleton className="h-3.5 sm:h-4 w-2/3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-11 w-full rounded-xl" />
          <Skeleton className="h-9 sm:h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ order_id?: string | string[]; session_id?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccess searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

