import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Services & Packages",
  description: "Manage your wedding service listings, packages, and pricing details.",
};

export default function VendorServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
