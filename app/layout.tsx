import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://threads.goodnewsco.church"),
  title: "Scripture Threads",
  description: "Trace, study, connect, and grow through source-grounded Bible study notes.",
  applicationName: "Scripture Threads",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "https://threads.goodnewsco.church",
    siteName: "Scripture Threads",
    title: "Scripture Threads",
    description: "Trace, study, connect, and grow through source-grounded Bible study notes.",
    images: [
      {
        url: "/assets/scripture-threads-header.png",
        width: 2048,
        height: 720,
        alt: "Scripture Threads"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Scripture Threads",
    description: "Trace, study, connect, and grow through source-grounded Bible study notes.",
    images: ["/assets/scripture-threads-header.png"]
  },
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
