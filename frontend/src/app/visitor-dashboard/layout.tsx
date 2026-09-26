import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Dashboard",
  description: "Manage your wedding planning, vendors, checklist, and budget on Say I Do.",
};

export default function VisitorDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
