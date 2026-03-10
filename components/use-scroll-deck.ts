"use client";

import { useEffect } from "react";

const GROUP_SELECTOR = "[data-deck-group]";
const CARD_SELECTOR = ".deck-card";

export function useScrollDeck() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    document.documentElement.classList.add("deck-enabled");

    const groupedCards = new Set<HTMLElement>();

    const groups = Array.from(document.querySelectorAll<HTMLElement>(GROUP_SELECTOR));
    groups.forEach((group) => {
      const cards = Array.from(group.querySelectorAll<HTMLElement>(CARD_SELECTOR));
      cards.forEach((card, index) => {
        groupedCards.add(card);
        if (!card.style.getPropertyValue("--deck-delay")) {
          card.style.setProperty("--deck-delay", `${index * 85}ms`);
        }
      });
    });

    const allCards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));
    allCards.forEach((card) => {
      if (!groupedCards.has(card) && !card.style.getPropertyValue("--deck-delay")) {
        card.style.setProperty("--deck-delay", "40ms");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            card.classList.add("deck-in");
            observer.unobserve(card);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    allCards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, []);
}
