"use client";

import VisitorHeader from "@/components/shared/Headers/VisitorHeader";
import WeddingDetails from "@/components/visitor-profile/WeddingDetails";
import AccountDetails from "@/components/visitor-profile/AccountDetails";
import ProfileMenu from "@/components/visitor-profile/ProfileMenu";
import React, { useState, useEffect } from "react";
import Footer from "@/components/shared/Footer";
import WeddingCoupleCard from '@/components/visitor-dashboard/WeddingCoupleCard';
import { useAuth } from '@/contexts/VisitorAuthContext';
import { useQuery } from '@apollo/client';
import { GET_VISITOR_BY_ID } from '@/graphql/queries';
import { StaticImageData } from 'next/image';

const VisitorProfile = () => {
  const { visitor } = useAuth();
  const [profilePic, setProfilePic] = useState<string | StaticImageData>('/images/visitorProfilePic.webp');

  const { data } = useQuery(GET_VISITOR_BY_ID, {
    variables: { id: visitor?.id },
    skip: !visitor?.id,
  });

  useEffect(() => {
    if (data?.findVisitorById?.profile_pic_url) {
      setProfilePic(data.findVisitorById.profile_pic_url);
    }
  }, [data?.findVisitorById?.profile_pic_url]);

  const visitorData = data?.findVisitorById;

  const [activeSection, setActiveSection] = useState("weddingDetails");

  const renderSection = () => {
    switch (activeSection) {
      case "weddingDetails":
        return <WeddingDetails />;
      case "accountDetails":
        return <AccountDetails />;
      default:
        return <WeddingDetails />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-lightYellow dark:bg-darkBg transition-colors duration-200">
      <VisitorHeader />
      <main className="flex-grow bg-lightYellow dark:bg-darkBg">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 w-full">
          {/* Wedding Couple Card Section */}
          <div className="mb-4 sm:mb-8">
            <WeddingCoupleCard
              profilePic={profilePic}
              setProfilePic={setProfilePic}
              weddingDate={visitorData?.wed_date}
              brideName={visitorData?.partner_fname}
              groomName={visitorData?.visitor_fname}
            />
          </div>

          {/* Page Header matching Vendor Settings */}
          <div className="mb-3 sm:mb-6">
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
              Profile Settings
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
              Manage your wedding details, partner information, and account security.
            </p>
          </div>

          {/* Settings Grid */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
            {/* Sidebar / Tab nav */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <ProfileMenu
                setActiveSection={setActiveSection}
                activeSection={activeSection}
              />
            </aside>

            {/* Main Content Area */}
            <div className="w-full flex-grow max-w-4xl">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VisitorProfile;