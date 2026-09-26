import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Service Listing",
  description: "Create and publish a new wedding service or package listing on Say I Do.",
};

export default function NewServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
