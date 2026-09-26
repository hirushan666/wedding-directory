import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Couple Sign In",
  description: "Sign in to access your wedding planning tools, saved vendors, and budget tracker.",
};

export default function VisitorLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
