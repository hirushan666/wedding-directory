import React, { Suspense } from "react";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";
import HelpCenter from "@/components/help/HelpCenter";
import { HelpCenterSkeleton } from "@/components/ui/shimmer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get instant answers and support for vendors and couples planning their perfect wedding on Say I Do.",
};

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-lightYellow dark:bg-darkBg text-gray-900 dark:text-zinc-100 font-body transition-colors duration-200">
      <Header />
      <Suspense fallback={<HelpCenterSkeleton />}>
        <HelpCenter />
      </Suspense>
      <Footer />
    </div>
  );
};

export default HelpPage;
