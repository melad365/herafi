import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
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
        <SessionProvider>{children}</SessionProvider>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fdfaf7',
              color: '#420e1e',
              border: '1px solid #f8d5db',
            },
          }}
        />
      </body>
    </html>
  );
}
