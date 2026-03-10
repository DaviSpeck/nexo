import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "NEXO",
  description: "NEXO Free: Markdown para PDF com anexos",
  icons: {
    icon: "/brand/nexo_logo_primary.svg",
    shortcut: "/brand/nexo_logo_primary.svg",
    apple: "/brand/nexo_logo_primary.png"
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const countryHeader =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    requestHeaders.get("x-country-code") ??
    "";

  const acceptLanguage = requestHeaders.get("accept-language") ?? "";
  const country = countryHeader.trim().toUpperCase();
  const ptCountries = new Set(["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "TL"]);
  const defaultLocale =
    ptCountries.has(country) || acceptLanguage.toLowerCase().includes("pt") ? "pt" : "en";

  const themeScript = `
    (function () {
      try {
        var stored = localStorage.getItem("nexo-theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
        document.documentElement.dataset.theme = theme;
        var storedLocale = localStorage.getItem("nexo-locale");
        var locale = (storedLocale === "pt" || storedLocale === "en") ? storedLocale : "${defaultLocale}";
        document.documentElement.dataset.locale = locale;
        document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
        if (!storedLocale) {
          localStorage.setItem("nexo-locale", locale);
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
