import React from "react";
import { Metadata } from "next";

//components
import Header from "@/components/shared/Headers/Header";
import Hero from "@/components/home/Hero";
import MasonaryGrid from "@/components/home/MasonaryGrid";
import PlanningSteps from "@/components/home/PlanningSteps";
import Testimonials from "@/components/home/Testimonials";
import Subscribe from "@/components/home/Subscribe";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: {
    absolute: "Say I Do | Wedding Planning & Vendor Directory Sri Lanka",
  },
  description:
    "Sri Lanka's premier wedding planning directory connecting couples with top verified wedding vendors, venues, photographers, planners, and services.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col justify-between">
      <Header />
      <main className="flex-1">
        <Hero />
        <MasonaryGrid />
        <PlanningSteps />
        <Subscribe />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
