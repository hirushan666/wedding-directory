import React from "react";
import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    id: 1,
    title: "Your Vendors",
    description:
      "Find verified wedding vendors tailored to your style, date, and budget across Sri Lanka.",
    buttonText: "Explore Services",
    href: "/services",
    image: "/images/venue.webp",
  },
  {
    id: 2,
    title: "Your Budget",
    description:
      "Set your spending limits, track expenses, and manage milestone payments effortlessly.",
    buttonText: "Set Up Budget",
    href: "/visitor-signup",
    image: "/images/cakes.webp",
  },
  {
    id: 3,
    title: "Your Checklist",
    description:
      "Stay ahead with our step-by-step wedding countdown and task management tools.",
    buttonText: "Start Checklist",
    href: "/visitor-signup",
    image: "/images/florists.webp",
  },
];

const PlanningSteps = () => {
  return (
    <section className="flex justify-center py-10 sm:py-14 bg-lightYellow dark:bg-darkSurface dark:bg-none border-y border-orange/15 dark:border-zinc-800 transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-title text-gray-900 dark:text-zinc-100 mb-8 sm:mb-10 text-center tracking-tight">
          Wedding planning has never been easier
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 sm:gap-8 w-full">
          {/* Responsive image container */}
          <div className="hidden lg:block lg:w-5/12 xl:w-[360px] shrink-0">
            <div className="relative h-full min-h-[340px] rounded-2xl overflow-hidden border border-orange/15 dark:border-zinc-800 shadow-sm">
              <Image
                src="/images/bridaldressing.webp"
                alt="Wedding Planning"
                className="object-cover"
                fill
              />
            </div>
          </div>

          {/* Responsive cards container */}
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-row items-center gap-3.5 sm:gap-5 p-3.5 sm:p-5 bg-white dark:bg-darkElevated border border-orange/15 dark:border-zinc-700/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-orange/10 dark:border-zinc-700">
                  <Image
                    src={card.image}
                    alt={card.title}
                    className="object-cover"
                    fill
                  />
                </div>
                <div className="flex flex-col text-left flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold font-title text-gray-900 dark:text-zinc-100">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-body text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                  <div className="mt-2.5 flex justify-start">
                    <Link
                      href={card.href}
                      className="px-3.5 py-1.5 rounded-xl border border-orange text-orange hover:bg-orange hover:text-white font-title text-xs sm:text-sm font-semibold transition-colors"
                    >
                      {card.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Couples CTA Section */}
        <div className="mt-10 sm:mt-12 text-center max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100 mb-2 tracking-tight">
            Ready to plan your dream wedding?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-body mb-5 leading-relaxed">
            Create your free couple account to unlock our budgeter, checklists, and connect with top-rated wedding vendors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/visitor-signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl font-title text-base font-semibold text-white bg-orange hover:bg-orange/90 active:scale-[0.98] transition-all shadow-xs"
            >
              Sign up as a couple
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl font-title text-base font-semibold text-gray-800 dark:text-zinc-200 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-darkElevated hover:border-orange dark:hover:border-orange hover:text-orange dark:hover:text-orange transition-all shadow-2xs"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanningSteps;
