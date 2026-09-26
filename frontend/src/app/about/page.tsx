import React from "react";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import Carousel from "@/components/about-us/Carousel";
import AboutUsSection from "@/components/about-us/AboutUsSection";
import PurposeAndVision from "@/components/about-us/PurposeAndVision";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
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

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8 sm:space-y-12">
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
      </main>

      <Footer />
    </div>
  );
};

export default AboutUsPage;


