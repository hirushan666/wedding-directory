"use client";

import React, { useState } from "react";
import Header from "@/components/shared/Headers/Header";
import VendorBanner from "@/components/vendor-dashboard/VendorBanner";
import SettingsMenu from "@/components/vendor-dashboard/dashboard-settings/SettingsMenu";
import EditProfile from "@/components/vendor-dashboard/dashboard-settings/EditProfile";
import Footer from "@/components/shared/Footer";
import EditGeneral from "@/components/vendor-dashboard/dashboard-settings/EditGeneral";
import EditAccount from "@/components/vendor-dashboard/dashboard-settings/EditAccount";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID } from "@/graphql/queries";
import { useVendorAuth } from "@/contexts/VendorAuthContext";

const VendorDashBoardSettings = () => {
  const { vendor } = useVendorAuth();
  const {
    data: vendorData} = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });
  const [activeSection, setActiveSection] = useState("general");
  const vendorInfo = vendorData?.findVendorById;

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <EditGeneral />;
      case "profile":
        return <EditProfile />;
      case "account":
        return <EditAccount />;
      default:
        return <EditGeneral />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="bg-lightYellow flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="font-title text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 font-body text-sm mt-1">
              Manage your business storefront, contact information, and account security.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <SettingsMenu
                setActiveSection={setActiveSection}
                activeSection={activeSection}
                vendorInfo={vendorInfo}
              />
            </div>

            {/* Dynamic Right Section */}
            <div className="w-full flex-grow max-w-4xl">{renderSection()}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorDashBoardSettings;
