'use client';
import { FaRegStar, FaStar } from "react-icons/fa";
import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@apollo/client";
import { FIND_REVIEW_PAGE_BY_SERVICE } from "@/graphql/queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface CommentsProps {
  serviceId?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  image_urls?: string[];
  createdAt: string;
  mentionedService?: {
    id: string;
    vendor?: {
      busname?: string;
    };
    name?: string;
  };
  mentionedOffering?: {
    id: string;
    vendor?: {
      busname?: string;
    };
    name?: string;
  };
  visitor: {
    visitor_fname: string;
  };
}

const REVIEWS_PER_PAGE = 5;

const Comments: React.FC<CommentsProps> = ({ serviceId }) => {
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPage(1);
  }, [serviceId]);

  const { data: rdata, loading: reviewsLoading, error: reviewsError } = useQuery(FIND_REVIEW_PAGE_BY_SERVICE, {
    variables: { service_id: serviceId, page, limit: REVIEWS_PER_PAGE },
    skip: !serviceId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    const totalPages = rdata?.findReviewsByServicePaginated?.totalPages;
    if (typeof totalPages === "number" && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, rdata]);

  const isInitialLoading = reviewsLoading && !rdata;

  if (isInitialLoading) {
    return (
      <div className="space-y-4 font-body animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-5 md:p-6 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }
  if (reviewsError) return null;

  const reviewPage = rdata?.findReviewsByServicePaginated;
  const reviewData = reviewPage?.reviews || [];
  const totalReviews = reviewPage?.totalReviews ?? 0;
  const totalPages = reviewPage?.totalPages ?? 1;
  const currentPage = reviewPage?.currentPage ?? 1;

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (containerRef.current) {
      const yOffset = -90; // accounts for sticky header
      const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  if (reviewData.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="font-body space-y-4 mt-6 scroll-mt-24 min-h-[280px]"
      role="list"
      aria-live="polite"
    >
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 font-title">
          Client Feedback ({totalReviews})
        </h3>
        <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Newest first</span>
      </div>

      <div className={`space-y-4 transition-opacity duration-200 ${reviewsLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        {reviewData.map((review: Review) => {
          const initials = (review.visitor?.visitor_fname || 'U').charAt(0).toUpperCase();
          return (
            <div
              key={review.id}
              role="listitem"
              className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header: Avatar, Name, Verified Badge, Rating & Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange to-amber-400 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-gray-900 dark:text-zinc-100 font-title">
                        {review.visitor?.visitor_fname || "Couple"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        ✓ Verified Booking
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-zinc-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, index) =>
                      index < review.rating ? (
                        <FaStar key={`${review.id}-${index}`} size={15} />
                      ) : (
                        <FaRegStar key={`${review.id}-${index}`} size={15} />
                      )
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 ml-1">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Review text */}
              {review.comment && (
                <p className="mt-3 text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
              )}

              {/* Mentioned offering/vendor tag */}
              {((review.mentionedService || review.mentionedOffering)?.id) && (() => {
                const mentioned = review.mentionedService || review.mentionedOffering!;
                return (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-orange/10 text-orange px-2.5 py-1 rounded-full font-medium">
                    <span>Tagged vendor:</span>
                    <Link
                      href={`/services/${mentioned.id}`}
                      className="hover:underline font-bold"
                    >
                      @{mentioned.vendor?.busname || mentioned.name || "Vendor"}
                    </Link>
                  </div>
                );
              })()}

              {/* Photo gallery (up to 3 photos) */}
              {review.image_urls && review.image_urls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {review.image_urls.slice(0, 3).map((url, index) => (
                    <a
                      key={`${review.id}-img-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`Review photo ${index + 1}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalReviews > REVIEWS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between pt-2">
          <Button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || reviewsLoading}
            className="w-28 font-semibold text-sm hover:border-orange hover:text-orange hover:bg-orange/10"
            variant="ornageOutline"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || reviewsLoading}
            className="w-28 font-semibold text-sm hover:border-orange hover:text-orange hover:bg-orange/10"
            variant="ornageOutline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Comments;
