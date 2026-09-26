import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Profile",
  description: "Manage your Say I Do user account details and preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
