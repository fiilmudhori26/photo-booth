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
  title: "my dipaaa💕",
  description:
    "Photo booth kawaii di ponsel kamu — jepret 3 pose, hias strip kamu, langsung unduh.",
};

export const viewport: Viewport = {
  themeColor: "#FBCFE8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
