"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MdArrowForwardIos, MdArrowBackIos } from "react-icons/md";

interface CarouselProps {
  images: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const minSwipeDistance = 45;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto-play interval with pause on interaction
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, images.length]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  return (
    <div
      className="relative w-full h-[175px] xs:h-[210px] sm:h-[340px] md:h-[420px] lg:h-[460px] rounded-2xl overflow-hidden shadow-md sm:shadow-lg border border-black/5 dark:border-zinc-800 bg-gray-100 dark:bg-darkSurface select-none group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Display the current image */}
      <Image
        src={images[currentIndex]}
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        priority={currentIndex === 0}
        alt={`Say I Do Wedding Showcase ${currentIndex + 1}`}
        className="object-cover transition-all duration-500 rounded-2xl pointer-events-none"
      />

      {/* Subtle gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none rounded-2xl" />

      {/* Left Arrow */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous image"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-95 cursor-pointer shadow-md border border-white/20 hover:border-white/40 z-10"
      >
        <MdArrowBackIos className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
      </button>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next image"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-95 cursor-pointer shadow-md border border-white/20 hover:border-white/40 z-10"
      >
        <MdArrowForwardIos className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Slide Dots / Indicators */}
      <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-black/35 backdrop-blur-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to image ${idx + 1}`}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? "w-5 sm:w-7 bg-orange shadow-xs"
                : "w-1.5 sm:w-2 bg-white/60 hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
