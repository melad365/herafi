import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { Toaster } from "sonner";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600"],
});

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
      <body className={`${dmSans.variable} ${lora.variable} flex flex-col min-h-screen`}>
        <SessionProviderWrapper>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
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
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
