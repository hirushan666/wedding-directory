import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Onboarding",
  description: "Complete your wedding business profile setup on Say I Do.",
};

export default function VendorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
