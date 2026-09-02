import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nezeal Ven & Shintal Khye — Wedding",
  description: "Wedding invitation and RSVP for Nezeal Ven & Shintal Khye."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}