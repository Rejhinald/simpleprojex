import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Sans, Open_Sans } from "next/font/google";
import "@/assets/style/globals.css";
import { UserProvider } from "@/components/contexts/user-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Simple Projex",
  description:
    "A partner-specific web application focused on streamlining the creation of proposals and contracts through a template-based system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClasses = [
    geistSans.variable, 
    geistMono.variable, 
    dmSans.variable, 
    openSans.variable, 
    "antialiased"
  ].join(" ");
  
  return (
    <html lang="en">
      <body className={bodyClasses}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}