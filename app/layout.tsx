import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scripture Threads",
  description: "Trace, study, connect, and grow through source-grounded Bible study notes.",
  applicationName: "Scripture Threads",
  appleWebApp: {
    capable: true,
    title: "Scripture Threads",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f1"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
