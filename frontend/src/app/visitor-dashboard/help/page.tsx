import React, { Suspense } from "react";
import VisitorHeader from "@/components/shared/Headers/VisitorHeader";
import Footer from "@/components/shared/Footer";
import HelpCenter from "@/components/help/HelpCenter";
import { HelpCenterSkeleton } from "@/components/ui/shimmer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Couple Help & Support",
  description:
    "Get wedding planning help, answers, and support for your big day on Say I Do.",
};

const VisitorDashboardHelpPage: React.FC = () => {
  return (
    <div className="bg-lightYellow dark:bg-darkBg min-h-screen flex flex-col font-body">
      <VisitorHeader />
      <Suspense fallback={<HelpCenterSkeleton />}>
        <HelpCenter initialRole="visitor" />
      </Suspense>
      <Footer />
    </div>
  );
};

export default VisitorDashboardHelpPage;
