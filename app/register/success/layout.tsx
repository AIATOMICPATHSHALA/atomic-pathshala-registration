import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration Successful",
  description: "You are registered for the Atomic Pathshala Biology Strategy Session.",
  robots: { index: false, follow: false },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
