import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Vendors",
  description: "Search and filter verified wedding vendors across Sri Lanka by location, category, and budget.",
};

export default function VendorSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
