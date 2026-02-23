import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isServiceWorkerEnabled } from "@/config/flags";

export const metadata: Metadata = {
  title: "Inchecken",
  description: "Dagelijkse check-in voor gedachten, gevoel en lichaam",
};

export const viewport: Viewport = {
  themeColor: "#5a4fff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const swEnabled = isServiceWorkerEnabled;

  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Satoshi-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Satoshi-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Satoshi-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="inchecken-sw-enabled" content={swEnabled ? "true" : "false"} />
        <Script src="/sw-reset.js" strategy="afterInteractive" />
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-[var(--radius-control)] bg-[var(--surface-elevated)] px-3 py-2 text-[13px] text-[var(--text-primary)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Ga naar inhoud
        </a>
        {swEnabled ? <RegisterSW /> : null}
        <WebVitalsReporter />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
