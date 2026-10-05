"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Sanduni & Tharindu",
    location: "Hapugala, Galle",
    text: "Our wedding day was everything we dreamed of, and it was all thanks to the amazing vendors we found through Say I Do. The process was seamless, and we were able to find everything we needed in one place. Highly recommended!",
    image: "/images/testimonial.webp",
  },
  {
    id: 2,
    name: "Sandun & Imasha",
    location: "Peradeniya, Kandy",
    text: "From the moment we started planning until the last dance at our reception, Say I Do was there for us. Their tools made budgeting and organizing stress-free, allowing us to enjoy every moment leading up to the big day.",
    image: "/images/testimonial.webp",
  },
];

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="flex justify-center py-4 sm:py-16 bg-lightYellow/40 dark:bg-darkBg transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-base sm:text-3xl md:text-4xl font-bold font-title text-gray-900 dark:text-zinc-100 text-center mb-2.5 sm:mb-10 tracking-tight">
          What other couples say about us
        </h2>

        {/* Mobile Compact Card */}
        <div className="sm:hidden w-full bg-white dark:bg-darkSurface border border-orange/15 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
          {/* Author & Controls Header Row */}
          <div className="flex items-center justify-between gap-2.5 mb-2 pb-2 border-b border-orange/10 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-orange/25 dark:border-orange/30 shrink-0">
                <Image
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="object-cover"
                  fill
                  sizes="36px"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-montez text-lg text-orange leading-tight truncate">
                  {testimonials[currentTestimonial].name}
                </h3>
                <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-gray-500 dark:text-zinc-400 leading-none truncate">
                  {testimonials[currentTestimonial].location}
                </p>
              </div>
            </div>

            {/* Embedded Controls: dots + arrows */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-1 mr-1">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentTestimonial(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentTestimonial === idx
                        ? "w-3 bg-orange"
                        : "w-1.5 bg-gray-300 dark:bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={prevTestimonial}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-orange/15 text-gray-600 dark:text-zinc-300 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                aria-label="Previous testimonial"
              >
                <FaCaretLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-darkElevated hover:bg-orange/15 text-gray-600 dark:text-zinc-300 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                aria-label="Next testimonial"
              >
                <FaCaretRight size={14} />
              </button>
            </div>
          </div>

          {/* Quote Text */}
          <p className="text-xs font-body text-gray-700 dark:text-zinc-300 italic leading-relaxed text-left">
            &ldquo;{testimonials[currentTestimonial].text}&rdquo;
          </p>
        </div>

        {/* Desktop Expansive Card & Controls */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-center w-full gap-2 sm:gap-4">
            <button
              type="button"
              onClick={prevTestimonial}
              className="p-2 rounded-full hover:bg-orange/10 dark:hover:bg-zinc-800 text-gray-400 hover:text-orange dark:text-zinc-500 dark:hover:text-orange transition-colors cursor-pointer shrink-0"
              aria-label="Previous testimonial"
            >
              <FaCaretLeft size={28} />
            </button>

            <div className="w-full">
              <div className="flex items-center gap-6 p-8 bg-white dark:bg-darkSurface border border-orange/15 dark:border-zinc-800 rounded-3xl shadow-sm w-full">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-orange/25 dark:border-orange/30 shadow-xs shrink-0">
                  <Image
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="object-cover"
                    fill
                    sizes="128px"
                  />
                </div>
                <div className="flex flex-col text-left flex-1 min-w-0">
                  <p className="text-base font-body text-gray-700 dark:text-zinc-300 italic leading-relaxed">
                    &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                  </p>
                  <h3 className="text-3xl font-montez text-orange mt-3">
                    {testimonials[currentTestimonial].name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider font-body font-semibold text-gray-500 dark:text-zinc-400 mt-0.5">
                    {testimonials[currentTestimonial].location}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={nextTestimonial}
              className="p-2 rounded-full hover:bg-orange/10 dark:hover:bg-zinc-800 text-gray-400 hover:text-orange dark:text-zinc-500 dark:hover:text-orange transition-colors cursor-pointer shrink-0"
              aria-label="Next testimonial"
            >
              <FaCaretRight size={28} />
            </button>
          </div>

          {/* Desktop Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentTestimonial(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentTestimonial === idx
                    ? "w-6 bg-orange shadow-xs"
                    : "w-2 bg-gray-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
