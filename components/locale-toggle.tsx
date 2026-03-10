"use client";

import { useLocale } from "@/components/locale";

export default function LocaleToggle() {
  const { locale, setLocale, ready } = useLocale();

  return (
    <div className="locale-toggle" role="group" aria-label="Language selector">
      <button
        type="button"
        className={locale === "pt" ? "active" : ""}
        onClick={() => setLocale("pt")}
        disabled={!ready}
      >
        PT
      </button>
      <button
        type="button"
        className={locale === "en" ? "active" : ""}
        onClick={() => setLocale("en")}
        disabled={!ready}
      >
        EN
      </button>
    </div>
  );
}
