import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Vendor",
  description: "Register your wedding business on Say I Do and connect with couples across Sri Lanka.",
};

export default function VendorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
