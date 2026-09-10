"use client";

import React, { useState } from "react";
import Header from "@/components/shared/Headers/Header";
import EditGeneral from "@/components/vendor-dashboard/dahboard-services/edit/EditGeneral";
import EditSocialLinks from "@/components/vendor-dashboard/dahboard-services/edit/EditSocialLinks";
import EditPortfolio from "@/components/vendor-dashboard/dahboard-services/edit/EditPortfolio";
import EditServiceSettings from "@/components/vendor-dashboard/dahboard-services/edit/EditServiceSettings";
import EditPackages from "@/components/vendor-dashboard/dahboard-services/edit/EditPackages";
import ServicesMenu from "@/components/vendor-dashboard/dahboard-services/ServicesMenu";
import VendorBanner from "@/components/vendor-dashboard/VendorBanner";
import Footer from "@/components/shared/Footer";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID } from "@/graphql/queries";
import { useVendorAuth } from "@/contexts/VendorAuthContext";

const EditService = () => {
  const { vendor } = useVendorAuth();

  const {data: vendorData} = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const vendorInfo = vendorData?.findVendorById;
  const [activeSection, setActiveSection] = useState("publicProfile");

  const renderSection = () => {
    switch (activeSection) {
      case "publicProfile":
        return <EditGeneral/>;
      case "socialContact":
        return <EditSocialLinks />;
      case "portfolio":
        return <EditPortfolio />;
      case "serviceSettings":
        return <EditServiceSettings />;
      case "packages":
        return <EditPackages />;
      default:
        return <EditGeneral/>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="bg-lightYellow flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="font-title text-3xl font-bold text-gray-900">Edit Service</h1>
            <p className="text-gray-500 font-body text-sm mt-1">
              Manage your service information, media, packages, and public visibility.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <ServicesMenu
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

export default EditService;
