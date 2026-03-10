"use client";

import { useEffect, useState } from "react";

export type Locale = "pt" | "en";

const STORAGE_KEY = "nexo-locale";
const LOCALE_EVENT = "nexo-locale-change";

function normalize(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  const lower = value.toLowerCase();
  if (lower.startsWith("pt")) {
    return "pt";
  }

  if (lower.startsWith("en")) {
    return "en";
  }

  return null;
}

function resolveBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  return normalize(navigator.language) ?? "en";
}

export function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const storedLocale = normalize(stored);
  if (storedLocale) {
    return storedLocale;
  }

  const datasetLocale = normalize(document.documentElement.dataset.locale);
  if (datasetLocale) {
    return datasetLocale;
  }

  return resolveBrowserLocale();
}

export function applyLocale(locale: Locale) {
  document.documentElement.dataset.locale = locale;
  document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = resolveInitialLocale();
    setLocaleState(initial);
    applyLocale(initial);
    window.localStorage.setItem(STORAGE_KEY, initial);
    setReady(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const next = normalize(event.newValue);
      if (!next) {
        return;
      }

      setLocaleState(next);
      applyLocale(next);
    };

    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<Locale>).detail;
      if (detail !== "pt" && detail !== "en") {
        return;
      }

      setLocaleState(detail);
      applyLocale(detail);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCALE_EVENT, onLocaleChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCALE_EVENT, onLocaleChange as EventListener);
    };
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    applyLocale(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent<Locale>(LOCALE_EVENT, { detail: next }));
  }

  return { locale, setLocale, ready };
}
