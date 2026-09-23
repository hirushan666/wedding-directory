"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiImage, FiX } from 'react-icons/fi';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_REVIEW } from '@/graphql/mutations';
import { CHECK_REVIEW_ELIGIBILITY, FIND_REVIEW_PAGE_BY_SERVICE } from '@/graphql/queries';
import { useAuth } from '@/contexts/VisitorAuthContext';
import toast from 'react-hot-toast';
import { uploadReviewImages } from '@/api/upload/review/reviewImages.upload';

interface WriteReviewProps {
    serviceId?: string;
    vendorName?: string;
}

const MAX_REVIEW_IMAGES = 3;

const WriteReview: React.FC<WriteReviewProps> = ({ serviceId, vendorName }) => {
    const { visitor } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [mentionVendor, setMentionVendor] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const { data: eligibilityData, loading: eligibilityLoading, refetch: refetchEligibility } = useQuery(
        CHECK_REVIEW_ELIGIBILITY,
        {
            variables: {
                service_id: serviceId || "",
                visitor_id: visitor?.id || "",
            },
            skip: !serviceId || !visitor?.id,
            fetchPolicy: 'network-only',
        }
    );

    const eligibility = eligibilityData?.checkReviewEligibility;

    const [createReview, { loading }] = useMutation(CREATE_REVIEW, {
        refetchQueries: [
            {
                query: FIND_REVIEW_PAGE_BY_SERVICE,
                variables: { service_id: serviceId, page: 1, limit: 5 },
            },
            ...(serviceId && visitor?.id
                ? [
                      {
                          query: CHECK_REVIEW_ELIGIBILITY,
                          variables: { service_id: serviceId, visitor_id: visitor.id },
                      },
                  ]
                : []),
        ],
        awaitRefetchQueries: true,
    });

    const activeRating = hoverRating || rating;

    const handleWriteReviewClick = () => {
        if (!visitor) {
            toast.error("You must be logged in to write a review", {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        if (eligibility && !eligibility.canReview) {
            toast.error(eligibility.message || "You are not eligible to review this service yet.");
            return;
        }

        setShowForm((prev) => !prev);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length + images.length > MAX_REVIEW_IMAGES) {
            toast.error(`You can upload a maximum of ${MAX_REVIEW_IMAGES} images.`);
        }
        const remainingSlots = Math.max(0, MAX_REVIEW_IMAGES - images.length);
        const filesToAdd = selectedFiles.slice(0, remainingSlots);
        setImages((prev) => [...prev, ...filesToAdd]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceId) {
            toast.error("Service not found.");
            return;
        }

        if (rating === 0) {
            toast("Please select a rating before submitting!");
            return;
        }

        if (!comment.trim() && images.length === 0) {
            toast("Please add a review comment or at least one image.");
            return;
        }

        if (images.length > MAX_REVIEW_IMAGES) {
            toast.error(`You can upload up to ${MAX_REVIEW_IMAGES} images.`);
            return;
        }

        try {
            const uploadedImageUrls = await uploadReviewImages(images);

            const response = await createReview({
                variables: {
                    input: {
                        rating,
                        comment,
                        image_urls: uploadedImageUrls,
                        mentioned_service_id: mentionVendor ? serviceId : null,
                        service_id: serviceId,
                        visitor_id: visitor?.id,
                    },
                },
            });

            if (response.data) {
                setRating(0);
                setComment("");
                setImages([]);
                setMentionVendor(true);
                setShowForm(false);
                await refetchEligibility();
                toast.success("Review submitted successfully!");
            }
        } catch (error: any) {
            const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || "Failed to submit review. Please try again.";
            toast.error(errorMessage);
        }
    };

    // Format pending event date if applicable
    const bookingDateFormatted = eligibility?.bookingDate
        ? new Date(eligibility.bookingDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null;

    // Only render for visitors who are eligible to submit a review per site requirements
    if (!visitor || eligibilityLoading || !eligibility?.canReview) {
        return null;
    }

    // Sentiment labels for star ratings
    const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Exceptional!"];

    return (
        <div className='font-body mt-4'>
            <div className='rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-5 md:p-6 shadow-sm space-y-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                    <div>
                        <h3 className='text-lg font-title font-bold text-gray-900 dark:text-zinc-100'>Share your experience</h3>
                        <p className='text-xs text-gray-500 dark:text-zinc-400 mt-0.5'>
                            Your authentic feedback helps future couples choose the right wedding vendor.
                        </p>
                    </div>

                    {eligibility?.reason === 'ALREADY_REVIEWED' ? (
                        <span className='inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60'>
                            ✓ Already Reviewed
                        </span>
                    ) : (
                        <Button
                            onClick={handleWriteReviewClick}
                            disabled={eligibility && !eligibility.canReview}
                            className={`w-full md:w-44 font-semibold text-sm rounded-xl py-2.5 transition-all ${
                                eligibility && !eligibility.canReview
                                    ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-darkElevated text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700'
                                    : 'text-white bg-orange hover:bg-orange/90 shadow-sm shadow-orange/20 active:scale-[0.99]'
                            }`}
                        >
                            {showForm ? "Close Form" : "Write a Review"}
                        </Button>
                    )}
                </div>

                {!eligibilityLoading && eligibility && (
                    <>
                        {eligibility.reason === 'ALREADY_REVIEWED' && (
                            <div className='rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2'>
                                <span className='text-base'>✓</span>
                                <span>You have already reviewed this service. Thank you for sharing your experience with the community!</span>
                            </div>
                        )}

                        {eligibility.reason === 'NOT_BOOKED' && (
                            <div className='rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2'>
                                <span className='text-base'>🔒</span>
                                <span>Verified couples only: You must have a completed package booking for this service to leave a review.</span>
                            </div>
                        )}

                        {eligibility.reason === 'EVENT_PENDING' && (
                            <div className='rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-3.5 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2'>
                                <span className='text-base'>📅</span>
                                <span>
                                    {bookingDateFormatted
                                        ? `You booked this service for ${bookingDateFormatted}. Your review option will unlock once your wedding date has passed.`
                                        : "You can leave a review once your booked event date has passed."}
                                </span>
                            </div>
                        )}
                    </>
                )}

                {/* Form - only rendered when user is logged in, eligible, and has opened the form */}
                {visitor && eligibility?.canReview && showForm && (
                    <form onSubmit={handleSubmit} className='border-t border-gray-100 dark:border-zinc-800 pt-5 space-y-5'>
                        <div>
                            <h4 className='text-sm font-semibold text-gray-900 dark:text-zinc-100'>Rate your overall experience</h4>
                            <div className='mt-2 flex items-center gap-3'>
                                <div className='flex items-center gap-1.5'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className='transition-transform hover:scale-125 focus:outline-none'
                                            aria-label={`${star} star`}
                                        >
                                            <FaStar
                                                size={28}
                                                className={star <= activeRating ? 'text-amber-400' : 'text-gray-200 dark:text-zinc-700'}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className='text-xs font-semibold text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-darkElevated px-2.5 py-1 rounded-full'>
                                    {activeRating > 0 ? ratingLabels[activeRating] : 'Select rating'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="review-comment" className='block text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wide'>
                                Your Review
                            </label>
                            <textarea
                                className='mt-1.5 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-darkElevated p-3 text-sm text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange min-h-[120px] transition-all'
                                id="review-comment"
                                name="content"
                                placeholder="How was the communication, punctuality, and service quality on your wedding day?"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={loading}
                            />
                            <div className='mt-1 text-right text-[11px] text-gray-400 dark:text-zinc-500 font-mono'>
                                {comment.trim().length} characters
                            </div>
                        </div>

                        <div>
                            <div className='flex items-center justify-between mb-2'>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wide'>
                                    Photos ({images.length}/{MAX_REVIEW_IMAGES})
                                </label>
                                <span className='text-[11px] text-gray-400 dark:text-zinc-500'>Max 3 photos (JPEG, PNG, WEBP)</span>
                            </div>

                            <div className='flex flex-wrap items-center gap-3'>
                                {images.length < MAX_REVIEW_IMAGES && (
                                    <label className='flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-orange hover:bg-orange/5 cursor-pointer transition-all text-gray-400 dark:text-zinc-500 hover:text-orange'>
                                        <FiImage size={20} />
                                        <span className='text-[10px] mt-1 font-medium'>Add Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className='hidden'
                                            onChange={handleFileChange}
                                            disabled={loading}
                                        />
                                    </label>
                                )}

                                {images.map((file, index) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    return (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className='relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm bg-gray-50 dark:bg-darkElevated'
                                        >
                                            <img
                                                src={previewUrl}
                                                alt={file.name}
                                                className='w-full h-full object-cover'
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                                                className='absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors'
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className='pt-1'>
                            <label className='inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-zinc-300 select-none'>
                                <input
                                    type="checkbox"
                                    checked={mentionVendor}
                                    onChange={(e) => setMentionVendor(e.target.checked)}
                                    disabled={loading}
                                    className='rounded text-orange focus:ring-orange/20 border-gray-300 dark:border-zinc-700 w-4 h-4'
                                />
                                <span>
                                    Tag vendor in review {vendorName ? `(@${vendorName})` : ''}
                                </span>
                            </label>
                        </div>

                        <div className='flex items-center gap-3 pt-2'>
                            <Button
                                className='w-36 font-semibold text-sm rounded-xl py-2 text-white bg-orange hover:bg-orange/90 shadow-sm shadow-orange/20 active:scale-[0.99]'
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Review"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className='text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 px-3 py-2'
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default WriteReview;
