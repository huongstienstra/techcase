import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Case Studies",
  description: "A searchable collection of technical case stories from major companies.",
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
