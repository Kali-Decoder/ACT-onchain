"use client";
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
          {children}
        
        </AppKitProvider>
      </body>
    </html>
  );
}
