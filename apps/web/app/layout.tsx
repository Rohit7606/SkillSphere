import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "../lib/providers/query-provider";
import { Toaster } from "../components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillSphere - Intelligent Hyperlocal Freelance Ecosystem",
  description: "Connect with Clients and Freelancers in a hyperlocal environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <Providers>
            {children}
            <Toaster theme="dark" position="bottom-right" />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
