import type { Metadata } from "next";
//@ts-ignore
import "./globals.css";
import "@/lib/fontawesome.config";

export const metadata: Metadata = {
  title: "Hospital Appointment System",
  description: "Get your appointment now",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
