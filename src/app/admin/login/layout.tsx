import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Required",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 