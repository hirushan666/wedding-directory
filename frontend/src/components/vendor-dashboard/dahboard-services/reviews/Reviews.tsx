import React from 'react';
import { FaRegStar, FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { useQuery } from "@apollo/client";
import {
    FIND_REVIEW_PAGE_BY_SERVICE,
    FIND_SERVICE_REVIEW_SUMMARY,
} from "@/graphql/queries";
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewsProps {
    serviceId?: string;
}

interface ReviewItem {
    id: string;
    rating: number;
    comment?: string;
    createdAt?: string;
    visitor?: {
        visitor_fname?: string;
    };
}

  
const Reviews: React.FC<ReviewsProps> = ({ serviceId }) => {
    const { data: rdata, loading: reviewsLoading, error: reviewsError } = useQuery(FIND_REVIEW_PAGE_BY_SERVICE, {
        variables: { service_id: serviceId, page: 1, limit: 5 },
        skip: !serviceId,
    });

    const {
        data: summaryData,
        loading: summaryLoading,
        error: summaryError,
    } = useQuery(FIND_SERVICE_REVIEW_SUMMARY, {
        variables: { service_id: serviceId },
        skip: !serviceId,
        fetchPolicy: 'cache-and-network',
    });

    if (reviewsLoading) {
        return (
            <div className='font-body animate-fade-in'>
                <div className='rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-6 shadow-sm'>
                    <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-center'>
                        <div className='md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 pb-5 md:pb-0 md:pr-6 space-y-3 w-full'>
                            <Skeleton className='h-3 w-24' />
                            <Skeleton className='h-12 w-28' />
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-3 w-40' />
                        </div>
                        <div className='md:col-span-7 space-y-3 w-full'>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className='flex items-center gap-3'>
                                    <Skeleton className='w-7 h-4' />
                                    <Skeleton className='h-2.5 flex-1 rounded-full' />
                                    <Skeleton className='w-8 h-4' />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (reviewsError) return <div>Error fetching reviews</div>;

    const reviewPage = rdata?.findReviewsByServicePaginated;
    const latestReviews: ReviewItem[] = reviewPage?.reviews ?? [];
    const totalReviews = reviewPage?.totalReviews ?? 0;
    const avgRating = reviewPage?.averageRating ?? 0;

    const recentDistribution = [5, 4, 3, 2, 1].map((star) => {
        const count = latestReviews.filter((review) => Math.round(review.rating) === star).length;
        const percentage = latestReviews.length ? (count / latestReviews.length) * 100 : 0;
        return { star, count, percentage };
    });

    const aiSummary = summaryData?.findServiceReviewSummary;

    const renderStars = (avgRating: number) => {
        const fullStars = Math.floor(avgRating);
        const halfStars = avgRating % 1;
        const emptyStars = 5 - Math.ceil(avgRating);

        return (
            <>
                {/* Full stars */}
                {Array.from({ length: fullStars }, (_, index) => (
                    <FaStar key={`star-full-${index}`} />
                ))}
                {/* Half star */}
                {halfStars>0 && <FaRegStarHalfStroke />}
                {/* Empty stars */}
                {Array.from({ length: emptyStars }, (_, index) => (
                    <FaRegStar key={`star-empty-${index}`} />
                ))}
            </>
        );
    };

    if (totalReviews === 0) {
        return (
            <div className='font-body'>
                <div className='rounded-2xl border border-dashed border-orange/30 bg-gradient-to-br from-white dark:from-darkSurface via-orange-50/20 dark:via-darkElevated/40 to-orange-50/40 dark:to-darkElevated/60 p-8 text-center shadow-sm'>
                    <div className='mx-auto w-12 h-12 rounded-full bg-orange/15 text-orange flex items-center justify-center text-xl mb-3'>
                        <FaStar />
                    </div>
                    <h3 className='text-lg font-title font-bold text-gray-900 dark:text-zinc-100'>No reviews yet</h3>
                    <p className='text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto mt-1'>
                        Couples love hearing real stories! If you booked this service, your feedback helps other couples plan their special day.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='font-body space-y-4'>
            <div className='rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-6 shadow-sm'>
                <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-center'>
                    {/* Left: Overall Rating */}
                    <div className='md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 pb-5 md:pb-0 md:pr-6'>
                        <span className='text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500'>
                            Overall Rating
                        </span>
                        <div className='mt-2 flex items-baseline gap-2'>
                            <span className='text-5xl font-title font-extrabold text-gray-900 dark:text-zinc-100 leading-none'>
                                {avgRating.toFixed(1)}
                            </span>
                            <span className='text-lg text-gray-400 dark:text-zinc-500 font-medium'>/ 5</span>
                        </div>
                        <div className='flex text-amber-400 text-xl my-2 gap-1'>
                            {renderStars(avgRating)}
                        </div>
                        <p className='text-xs text-gray-500 dark:text-zinc-400 font-medium'>
                            Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
                        </p>
                    </div>

                    {/* Right: Rating Breakdown Bars */}
                    <div className='md:col-span-7 space-y-2.5'>
                        {recentDistribution.map((item) => (
                            <div key={item.star} className='flex items-center gap-3 text-xs'>
                                <span className='w-7 font-bold text-gray-700 dark:text-zinc-300 text-right flex items-center justify-end gap-0.5'>
                                    {item.star} <FaStar className='text-amber-400 text-[10px]' />
                                </span>
                                <div className='h-2 flex-1 rounded-full bg-gray-100 dark:bg-darkElevated overflow-hidden'>
                                    <div
                                        className='h-full bg-gradient-to-r from-amber-400 to-orange rounded-full transition-all duration-300'
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className='w-8 text-right font-medium text-gray-500 dark:text-zinc-400'>
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

    {summaryLoading ? (
        <div className='rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-5 shadow-sm space-y-3'>
            <div className='flex items-center justify-between gap-4'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-24' />
            </div>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-11/12' />
            <Skeleton className='h-4 w-9/12' />
        </div>
    ) : (
        <div className='relative rounded-2xl bg-white dark:bg-darkSurface shadow-md transition-all duration-300 hover:shadow-lg'>

            {/* Animated orange line following the entire border */}
            <svg
                className='absolute inset-0 w-full h-full pointer-events-none z-20'
                viewBox='0 0 1000 300'
                preserveAspectRatio='none'
            >
                <rect
                    x='2'
                    y='2'
                    width='996'
                    height='296'
                    rx='28'
                    ry='28'
                    fill='none'
                    stroke='#f97316'
                    strokeWidth='4'
                    pathLength='1000'
                    strokeDasharray='250 750'
                    strokeLinecap='round'
                >
                    <animate
                        attributeName='stroke-dashoffset'
                        from='0'
                        to='-1000'
                        dur='7s'
                        repeatCount='indefinite'
                    />
                </rect>
            </svg>

            {/* Card content */}
            <div className='relative rounded-2xl bg-gradient-to-br from-orange-50/40 via-white to-white dark:from-orange-950/20 dark:via-darkSurface dark:to-darkSurface p-5'>

                <div className='flex items-center justify-between gap-3 flex-wrap mb-3'>
                    <div>
                        <h2 className='text-[15px] font-semibold text-gray-900 dark:text-zinc-100 font-title'>
                            AI Review Summary
                        </h2>

                        <p className='text-xs text-gray-400 dark:text-zinc-500'>
                            Generated from the latest couple reviews
                        </p>
                    </div>

                    {aiSummary?.lastReviewAt && (
                        <span className='text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-900/30'>
                            Updated {new Date(aiSummary.lastReviewAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {summaryError ? (
                    <p className='text-sm text-red-500 dark:text-red-400 leading-relaxed'>
                        AI summary is unavailable right now.
                    </p>
                ) : aiSummary?.summaryText ? (
                    <p className='text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap'>
                        {aiSummary.summaryText}
                    </p>
                ) : (
                    <p className='text-sm text-gray-500 dark:text-zinc-400 leading-relaxed italic'>
                        No AI summary yet.
                    </p>
                )}

            </div>
        </div>
    )}

        </div>
    );
};

export default Reviews;
