import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Setup",
  description: "Set up your wedding date, style, and planning preferences on Say I Do.",
};

export default function VisitorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
