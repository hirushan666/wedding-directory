import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your wedding business, bookings, calendar, and client inquiries on Say I Do.",
};

export default function VendorDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
