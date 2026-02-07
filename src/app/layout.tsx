import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Herafi",
  description: "Services marketplace for in-person and digital work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
