import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Viducate - AI-Powered Educational Videos",
  description: "Create engaging educational videos with AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Header */}
          <Header />

          {/* Main content */}
          <main className="min-h-screen pt-24">{children}</main>

          {/* Toast notifications */}
          <Toaster position="top-center" />

          {/* Footer */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made by Prakhar Sahu, Kshitij Prasad</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
