import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Photo Gallery",
  description: "View wedding portfolio and photo gallery on Say I Do.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
