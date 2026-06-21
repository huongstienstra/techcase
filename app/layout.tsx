import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Android App Case Studies",
  description: "A searchable collection of Android app case stories from Android Developers and engineering teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
