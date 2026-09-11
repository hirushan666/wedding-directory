import PaymentSuccess from '@/components/stripe/PaymentSuccess';
import { Suspense } from 'react';
import LoaderJelly from '@/components/shared/Loaders/LoaderJelly';

export default function SuccessPage({
  searchParams,
}: {
  searchParams?: { order_id?: string | string[]; session_id?: string | string[] };
}) {
  return (
    <Suspense fallback={<LoaderJelly />}>
      <PaymentSuccess searchParams={searchParams} />
    </Suspense>
  );
}

