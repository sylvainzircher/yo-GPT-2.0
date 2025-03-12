"use client";
import APIKeyWarning from "@/components/API-key-warning";
import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  const apiKey = process.env.NEXT_PUBLIC_FIREWORKS_API_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Toaster richColors position="top-center" />
        {/* Show Warning if API Key is Missing */}
        {!apiKey ? <APIKeyWarning /> : children}
      </body>
    </html>
  );
}
