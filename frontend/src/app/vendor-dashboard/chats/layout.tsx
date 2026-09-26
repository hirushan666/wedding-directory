import React from "react";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import Footer from "@/components/shared/Footer";

const VendorDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex flex-col justify-between transition-colors duration-200">
      <VendorHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default VendorDashboardLayout;
