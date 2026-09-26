import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and update your couple profile and wedding information on Say I Do.",
};

export default function VisitorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
