import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Configure our primary font
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"]
});

// Set the tab title and description
export const metadata: Metadata = {
  title: "Al-Azamat Medical Store",
  description: "Enterprise Pharmacy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakarta.className} antialiased min-h-screen flex flex-col bg-slate-950 text-white overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}