import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Insights",
  description: "Track your wedding business views, profile clicks, and lead performance.",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
