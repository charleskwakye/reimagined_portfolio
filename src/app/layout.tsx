import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ClientInteraction from '@/components/ClientInteraction';
import { Providers } from "./providers";

// Apple uses SF Pro, but Inter is the closest open-source equivalent
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Charles Kwakye | Full Stack Developer",
    template: "%s | Charles Kwakye",
  },
  description: "Full Stack Developer specializing in modern web technologies. Building accessible, responsive, and performant web applications with React, Next.js, and TypeScript.",
  keywords: ["Full Stack Developer", "React", "Next.js", "TypeScript", "Web Development", "Software Engineer"],
  authors: [{ name: "Charles Kwakye" }],
  creator: "Charles Kwakye",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://charleskwakye.dev",
    title: "Charles Kwakye | Full Stack Developer",
    description: "Full Stack Developer specializing in modern web technologies.",
    siteName: "Charles Kwakye Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charles Kwakye | Full Stack Developer",
    description: "Full Stack Developer specializing in modern web technologies.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        href: '/favicon.ico',
      },
      {
        url: '/portfolio_favicon_io/favicon-16x16.png',
        href: '/portfolio_favicon_io/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/portfolio_favicon_io/favicon-32x32.png',
        href: '/portfolio_favicon_io/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      }
    ],
    apple: '/portfolio_favicon_io/apple-touch-icon.png',
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      }
    ]
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastProvider />
          </ThemeProvider>
          <ClientInteraction />
        </Providers>
      </body>
    </html>
  );
}
