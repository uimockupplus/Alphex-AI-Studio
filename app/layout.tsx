
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Alphex AI Studio",
    template: "%s | Alphex AI Studio"
  },
  description:
    "Import your project, edit code with AI, preview your changes, and prepare your website for deployment. Powered by Alphex AI.",
  applicationName: "Alphex AI Studio",
  keywords: [
    "Alphex AI Studio",
    "Alphex AI",
    "AI code editor",
    "browser code workspace",
    "HTML preview",
    "web development"
  ],
  robots: {
    index: false,
    follow: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
