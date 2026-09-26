import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Couple",
  description: "Create an account to start planning your wedding, manage your budget, and book vendors.",
};

export default function VisitorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
