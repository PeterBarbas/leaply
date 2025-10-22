import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leaply - Explore your next career",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          id="Cookiebot" 
          src="https://consent.cookiebot.com/uc.js" 
          data-cbid="d9c7b88e-b648-4262-9665-fc7102c62640" 
          data-blockingmode="auto" 
          type="text/javascript"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        {children}
        <Footer />
        <script 
          id="CookieDeclaration" 
          src="https://consent.cookiebot.com/d9c7b88e-b648-4262-9665-fc7102c62640/cd.js" 
          type="text/javascript" 
          async
        />
      </body>
    </html>
  );
}
