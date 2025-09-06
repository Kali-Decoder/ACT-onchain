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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <meta
          name="fc:frame"
          content='{
      "version": "1",
      "imageUrl": "https://media.tenor.com/X73qwZxReB0AAAAM/fiery-virat-kohli.gif",
       "button": {
          "title": "Cricket Mania",
          "action": {
            "type": "launch_frame",
            "name": "Cricket Mania",
            "url": "http://cricket-mania-lovat.vercel.app/",
            "splashImageUrl": "https://media.tenor.com/yDA46Ztr58AAAAAM/virat-funny-virat-huh.gif",
            "splashBackgroundColor": "black"
          }
        }
     }'
        />
      </head>

      <body>
        <AppKitProvider>
          <>
            <Navbar />
            {children}
          </>
        </AppKitProvider>
      </body>
    </html>
  );
}
