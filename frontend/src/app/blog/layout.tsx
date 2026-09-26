import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Blog & Inspiration",
  description: "Wedding planning guides, real wedding stories, vendor spotlights, and inspiration in Sri Lanka.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
