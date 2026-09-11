import React from "react";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";

const VendorDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-lightYellow flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default VendorDashboardLayout;
