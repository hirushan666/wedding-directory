"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const MasonaryGrid = () => {
  const photos = [
    {
      id: 1,
      src: "/images/photography.webp",
      alt: "Photographers",
      label: "Browse galleries to find your look",
    },
    {
      id: 2,
      src: "/images/cakes.webp",
      alt: "Wedding Cakes",
      label: "Discover the perfect cake for your big day",
    },
    {
      id: 3,
      src: "/images/invitation.webp",
      alt: "Invitations",
      label: "Explore elegant invitation designs",
    },
    {
      id: 4,
      src: "/images/preshoot.webp",
      alt: "Pre-wedding Shoots",
      label: "Capture memories with a pre-wedding shoot",
    },
    {
      id: 5,
      src: "/images/tablesetting.webp",
      alt: "Table Settings",
      label: "Find inspiration for your wedding table settings",
    },
    {
      id: 6,
      src: "/images/transportation.webp",
      alt: "Transportation",
      label: "Arrange stylish transportation for your wedding",
    },
    {
      id: 7,
      src: "/images/DJ.webp",
      alt: "Wedding DJ",
      label: "Find the perfect DJ to keep the party going",
    },
    {
      id: 8,
      src: "/images/bride.webp",
      alt: "Bridal Looks",
      label: "Get inspired by stunning bridal looks",
    },
  ];

  return (
    <section className="bg-lightYellow/60 dark:bg-darkBg py-6 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-10">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-title text-gray-900 dark:text-zinc-100 tracking-tight">
          Locate Vendors For Every Vibe
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-600 dark:text-zinc-400 font-body">
          Find Top-Rated Pros for Every Budget, Background, and Style
        </p>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {/* Mobile Horizontal Snap Carousel */}
        <div className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="snap-start shrink-0 w-36 xs:w-40 relative overflow-hidden rounded-xl border border-orange/15 dark:border-zinc-800 shadow-2xs group"
            >
              <Link href="/services" className="block relative aspect-[4/5]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  fill
                  sizes="160px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="font-title font-semibold text-xs truncate block leading-tight">
                    {photo.alt}
                  </span>
                  <span className="text-[10px] text-orange font-bold uppercase tracking-wider block mt-0.5">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop Masonry Columns */}
        <div className="hidden sm:block columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative overflow-hidden rounded-2xl break-inside-avoid group border border-orange/15 dark:border-zinc-800 shadow-2xs hover:shadow-md transition-all"
            >
              <Link href="/services" className="block relative">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  width={500}
                  height={500}
                />

                {/* Desktop Hover Overlay */}
                <div className="flex absolute inset-0 items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 p-4">
                  <div className="text-center">
                    <h3 className="text-white text-lg sm:text-xl font-bold font-title">
                      {photo.alt}
                    </h3>
                    <p className="text-zinc-200 mt-1 text-xs sm:text-sm font-body max-w-xs mx-auto">
                      {photo.label}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MasonaryGrid;
