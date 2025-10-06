import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomThirdwebProvider } from "@/components/ThirdwebProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubStream - Seamless subscription flows on-chain",
  description: "Experience seamless on-chain subscriptions powered by Kwala. Access premium weather data and services with blockchain-based subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomThirdwebProvider>
          {children}
        </CustomThirdwebProvider>
      </body>
    </html>
  );
}
