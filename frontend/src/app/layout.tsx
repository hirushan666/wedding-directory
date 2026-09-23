import type { Metadata } from "next";
import { AuthProvider as VisitorAuthProvider } from "@/contexts/VisitorAuthContext";
import ApolloWrapper from "@/apollo/ApolloWrapper";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import PageTransition from "@/components/PageTransition";
import { VendorAuthProvider } from "@/contexts/VendorAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/components/shared/ScrollToTop";
import GoogleAuthProviderWrapper from "@/components/auth/GoogleAuthProviderWrapper";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

import localFont from "next/font/local";
import React from "react";

const montserratFont = localFont({
  src: [
    {
      path: "./fonts/Montserrat-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
});

const merriweatherFont = localFont({
  src: [
    {
      path: "./fonts/Merriweather-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Merriweather-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Merriweather-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Merriweather-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-merriweather",
});

const montezFont = localFont({
  src: [
    {
      path: "./fonts/Montez-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-montez",
});

const outfitFont = localFont({
  src: [
    {
      path: "./fonts/Outfit-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Outfit-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Outfit-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
});

const marckScriptFont = localFont({
  src: [
    {
      path: "./fonts/MarckScript-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-marck-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sayido.lk"),
  title: {
    default: "Say I Do",
    template: "%s | Say I Do",
  },
  description: "Your central hub for all things wedding",
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "LzToS2ShoWRSCnzqc98_lGewVgkZIN-LHglx_5QpS6M",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sayido.lk",
    title: "Say I Do",
    description: "Your central hub for all things wedding-related",
    siteName: "Say I Do",
    images: [
      {
        url: "/images/hero.webp",
        width: 1200,
        height: 630,
        alt: "Say I Do - Your central hub for all things wedding-related",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname;
                  var isDashboard = path === '/' ||
                    path.indexOf('/visitor-') === 0 ||
                    path.indexOf('/vendor-') === 0 ||
                    path.indexOf('/guest-list') === 0 ||
                    path.indexOf('/services') === 0 ||
                    path.indexOf('/login') === 0 ||
                    path.indexOf('/sign-up') === 0 ||
                    path.indexOf('/forgot-password') === 0 ||
                    path.indexOf('/blog') === 0 ||
                    path.indexOf('/about') === 0 ||
                    path.indexOf('/contact') === 0 ||
                    path.indexOf('/help') === 0 ||
                    path.indexOf('/privacy-policy') === 0 ||
                    path.indexOf('/terms-of-use') === 0 ||
                    path.indexOf('/success') === 0 ||
                    path.indexOf('/payment-failed') === 0 ||
                    path.indexOf('/payment-pending') === 0 ||
                    path.indexOf('/profile') === 0;

                  var theme = localStorage.getItem('sayido_dashboard_theme');
                  if (isDashboard && theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${montserratFont.variable} ${merriweatherFont.variable} ${montezFont.variable} ${outfitFont.variable} ${marckScriptFont.variable}`}
      >
        <ApolloWrapper>
          <GoogleAuthProviderWrapper>
            {/* Wrapping the application with VisitorProvider */}
            <VisitorAuthProvider>
              <VendorAuthProvider>
                <ThemeProvider>
                  <PageTransition>
                    {children}
                    <Toaster reverseOrder={false} />
                    <ScrollToTop />
                  </PageTransition>
                </ThemeProvider>
              </VendorAuthProvider>
              {/* PageTransition can wrap around the children to handle animations */}
            </VisitorAuthProvider>
          </GoogleAuthProviderWrapper>
        </ApolloWrapper>
      </body>
      <GoogleAnalytics gaId="G-TRC1DH6VXM" />
      <Script async src="https://tally.so/widgets/embed.js" />
    </html>
  );
}
