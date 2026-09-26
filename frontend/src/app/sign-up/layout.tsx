import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join Say I Do to plan your dream wedding or showcase your wedding services.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
