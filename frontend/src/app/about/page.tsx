import React from "react";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import Carousel from "@/components/about-us/Carousel";
import AboutUsSection from "@/components/about-us/AboutUsSection";
import PurposeAndVision from "@/components/about-us/PurposeAndVision";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Say I Do",
  description: "Learn more about Say I Do, our mission to simplify wedding planning, and how we connect couples with Sri Lanka's finest wedding vendors.",
};

const AboutUsPage: React.FC = () => {
  const images = [
    "/images/Carousel_1.webp",
    "/images/Carousel_2.webp",
    "/images/Carousel_3.webp",
    "/images/Carousel_4.webp",
    "/images/Carousel_5.webp",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 w-full space-y-3 sm:space-y-5">
        {/* Carousel Section */}
        <section aria-label="Photo Carousel" className="w-full">
          <Carousel images={images} />
        </section>

        {/* About Us Section */}
        <section aria-label="About Us">
          <AboutUsSection />
        </section>

        {/* Purpose and Vision */}
        <section aria-label="Our Purpose and Mission">
          <PurposeAndVision />
        </section>

        {/* Call to Action Section */}
        <section aria-label="Get Started" className="w-full pb-2 sm:pb-4">
          <div className="bg-gradient-to-br from-orange/15 via-orange/10 to-amber-100/30 dark:from-orange/20 dark:via-darkElevated dark:to-darkSurface rounded-2xl border border-orange/20 dark:border-zinc-800 p-4 sm:p-6 text-center transition-colors">
            <h3 className="font-title font-bold text-base sm:text-xl text-gray-900 dark:text-zinc-100 mb-1">
              Ready to Plan Your Dream Wedding?
            </h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400 max-w-md mx-auto mb-3 font-body leading-relaxed">
              Find verified vendors and start planning your special day.
            </p>
            <div className="flex flex-row items-center justify-center gap-2.5 max-w-xs mx-auto">
              <Link
                href="/services"
                className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-orange hover:bg-orange/90 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 text-center"
              >
                Explore Services
              </Link>
              <Link
                href="/vendor-signup"
                className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-white dark:bg-darkSurface border border-orange/30 hover:border-orange text-orange font-semibold text-xs transition-all shadow-xs active:scale-95 text-center"
              >
                Join as Vendor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUsPage;


