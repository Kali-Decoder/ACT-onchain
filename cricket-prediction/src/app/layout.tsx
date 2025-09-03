"use client";

import "./globals.css";
import Providers from "@/providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
          <Providers>{children}</Providers>
          <Toaster position="bottom-left" />
      </body>
    </html>
  );
}
