import React from "react";
import { Metadata } from "next";
import Header from "@/components/shared/Headers/Header";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Payment Processing",
  description: "Your payment transaction is being verified and processed.",
};

export default function PaymentPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="w-full print:hidden">
        <Header />
      </div>
      <main className="min-h-[calc(100vh-5rem)] bg-lightYellow dark:bg-darkBg px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
