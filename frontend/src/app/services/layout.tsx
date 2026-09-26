import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Vendors & Services",
  description: "Browse and discover top wedding vendors in Sri Lanka across all categories.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
