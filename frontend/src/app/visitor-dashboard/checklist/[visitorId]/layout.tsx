import React from "react";
import { Metadata } from "next";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Wedding Planning Checklist",
  description: "Stay organized with your personalized step-by-step wedding planning checklist.",
};

const ChecklistLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-lightYellow dark:bg-darkBg min-h-screen flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ChecklistLayout;
