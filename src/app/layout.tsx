import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: "Herafi - Find Local Service Providers",
  description: "Connect with skilled professionals in your area. From cleaning to repairs, get quality service at the right price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
