import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";

const themeInitScript = `
(() => {
  try {
    const key = "inchecken-theme-preference";
    const stored = window.localStorage.getItem(key);
    const preference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = preference === "system" ? (isDark ? "dark" : "light") : preference;
    document.documentElement.setAttribute("data-theme-preference", preference);
    document.documentElement.setAttribute("data-theme", resolved);
  } catch {
    document.documentElement.setAttribute("data-theme-preference", "system");
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

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
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
