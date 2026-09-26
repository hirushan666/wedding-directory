import React, { Fragment } from "react";
import { Metadata } from "next";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your payment was processed successfully. Thank you for booking through Say I Do.",
};

const SuccessLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Fragment>
      <div className="w-full print:hidden">
        <Header />
      </div>

      <div className="bg-lightYellow dark:bg-darkBg min-h-[calc(100vh-5rem)] print:bg-white print:min-h-0 print:p-0">
        <div className="w-full max-w-6xl mx-auto px-3 py-6 sm:px-6 sm:py-10 lg:px-8 print:max-w-full print:p-0 print:m-0">
          {children}
        </div>
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </Fragment>
  );
};

export default SuccessLayout;
