import React from "react";
import { Metadata } from "next";
import VisitorHeader from "@/components/shared/Headers/VisitorHeader";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Guest List Manager",
  description: "Organize your wedding guest list, RSVPs, meal preferences, and invitations.",
};

const GuestListLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-lightYellow dark:bg-darkBg min-h-screen flex flex-col justify-between transition-colors duration-200">
      <VisitorHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GuestListLayout;

