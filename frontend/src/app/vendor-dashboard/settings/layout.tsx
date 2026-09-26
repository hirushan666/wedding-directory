import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Settings & Profile",
  description: "Update your wedding business profile, contact information, and account settings.",
};

export default function VendorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
