import type { Metadata, Viewport } from "next";
import "@fontsource/cherry-bomb-one/400.css";
import "@fontsource/m-plus-rounded-1c/400.css";
import "@fontsource/m-plus-rounded-1c/500.css";
import "@fontsource/m-plus-rounded-1c/700.css";
import "@fontsource/m-plus-rounded-1c/800.css";
import "@fontsource/gaegu/400.css";
import "@fontsource/gaegu/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photo Booth — Snap 3 Poses, Download Your Strip",
  description:
    "A playful web photo booth — snap three poses, decorate your strip and download it in high resolution.",
  applicationName: "Photo Booth",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
