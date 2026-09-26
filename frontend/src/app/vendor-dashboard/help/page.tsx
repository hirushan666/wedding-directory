import React, { Suspense } from "react";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import Footer from "@/components/shared/Footer";
import HelpCenter from "@/components/help/HelpCenter";
import { HelpCenterSkeleton } from "@/components/ui/shimmer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Help & Support",
  description:
    "Vendor knowledge base, guide, and support desk for managing your wedding business on Say I Do.",
};

const VendorDashboardHelpPage: React.FC = () => {
  return (
    <div className="bg-lightYellow dark:bg-darkBg min-h-screen flex flex-col font-body">
      <VendorHeader />
      <Suspense fallback={<HelpCenterSkeleton />}>
        <HelpCenter initialRole="vendor" />
      </Suspense>
      <Footer />
    </div>
  );
};

export default VendorDashboardHelpPage;
