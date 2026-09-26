import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Service Listing",
  description: "Update and edit your wedding service details, packages, and pricing on Say I Do.",
};

export default function EditServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
