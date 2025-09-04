"use client";
import Navbar from "@/component/Navbar";
import "./globals.css";
import AppKitProvider from '@/providers/client-providers'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppKitProvider>
          <>
            <Navbar/>
            {children}
          </>
        </AppKitProvider>
      </body>
    </html>
  );
}
