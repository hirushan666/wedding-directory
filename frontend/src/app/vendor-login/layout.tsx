import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Portal Login",
  description: "Sign in to manage your wedding business profile, bookings, and customer inquiries.",
};

export default function VendorLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
