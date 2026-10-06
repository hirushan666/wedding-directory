"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import EditGeneral from "@/components/vendor-dashboard/dahboard-services/edit/EditGeneral";
import EditSocialLinks from "@/components/vendor-dashboard/dahboard-services/edit/EditSocialLinks";
import EditPortfolio from "@/components/vendor-dashboard/dahboard-services/edit/EditPortfolio";
import EditPackages from "@/components/vendor-dashboard/dahboard-services/edit/EditPackages";
import ServicesMenu from "@/components/vendor-dashboard/dahboard-services/ServicesMenu";
import Footer from "@/components/shared/Footer";
import { useQuery } from "@apollo/client";
import { GET_VENDOR_BY_ID } from "@/graphql/queries";
import { useVendorAuth } from "@/contexts/VendorAuthContext";

const EditServiceContent = () => {
  const { vendor } = useVendorAuth();
  const searchParams = useSearchParams();

  const { data: vendorData } = useQuery(GET_VENDOR_BY_ID, {
    variables: { id: vendor?.id },
    skip: !vendor?.id,
  });

  const vendorInfo = vendorData?.findVendorById;
  const sectionParam = searchParams.get("section") || searchParams.get("tab");
  const [activeSection, setActiveSection] = useState(sectionParam || "publicProfile");

  useEffect(() => {
    const section = searchParams.get("section") || searchParams.get("tab");
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case "publicProfile":
        return <EditGeneral />;
      case "socialContact":
        return <EditSocialLinks />;
      case "portfolio":
        return <EditPortfolio />;
      case "packages":
        return <EditPackages />;
      default:
        return <EditGeneral />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-lightYellow dark:bg-darkBg transition-colors duration-200">
      <VendorHeader />
      <div className="bg-lightYellow dark:bg-darkBg flex-grow">
        <div className="container mx-auto px-3.5 sm:px-4 py-3.5 sm:py-8">
          <div className="mb-6">
            <h1 className="font-title text-3xl font-bold text-gray-900 dark:text-zinc-100">Edit Service</h1>
            <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
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

const EditService = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-lightYellow dark:bg-darkBg flex items-center justify-center text-orange">
          Loading...
        </div>
      }
    >
      <EditServiceContent />
    </Suspense>
  );
};

export default EditService;
