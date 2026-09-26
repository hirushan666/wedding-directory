import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Say I Do account password.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
