import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payouts & Earnings",
  description: "View your wedding booking earnings, payout status, and transaction history.",
};

export default function VendorPaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
