import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkRadar",
  description: "Find nearby streets with better estimated free-parking odds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}