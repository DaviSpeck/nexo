"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale";
import { CONTACTS, CONTACT_LINKS } from "@/lib/contacts";

const copy = {
  pt: {
    product: "Navegação",
    home: "Home",
    free: "Free Converter",
    pricing: "Planos e acesso",
    support: "Suporte",
    help: "Central de suporte",
    email: "Contato por e-mail",
    whatsapp: "Atendimento via WhatsApp",
    legal: "Legal",
    terms: "Termos de uso",
    privacy: "Política de privacidade",
    security: "Segurança",
    rights: "Todos os direitos reservados."
  },
  en: {
    product: "Navigation",
    home: "Home",
    free: "Free Converter",
    pricing: "Plans and access",
    support: "Support",
    help: "Support center",
    email: "Contact by e-mail",
    whatsapp: "WhatsApp support",
    legal: "Legal",
    terms: "Terms of use",
    privacy: "Privacy policy",
    security: "Security",
    rights: "All rights reserved."
  }
} as const;

type SiteFooterProps = {
  onFreeClick?: () => void;
  onPricingClick?: () => void;
  onSupportClick?: () => void;
};

export default function SiteFooter({
  onFreeClick,
  onPricingClick,
  onSupportClick,
}: SiteFooterProps) {
  const { locale } = useLocale();
  const c = copy[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-head">
        <Link href="/" className="hero-brand hero-brand-link">
          <img alt="NEXO" src="/brand/nexo_logo_primary.svg" />
          <strong>NEXO</strong>
        </Link>
        <p>{locale === "pt" ? "Documentos executivos a partir de markdown, com padrão institucional." : "Executive-ready documents from markdown with institutional quality."}</p>
      </div>
      <div className="site-footer-grid">
        <section>
          <h3>{c.product}</h3>
          <Link href="/">{c.home}</Link>
          <Link href="/#free-converter" onClick={onFreeClick}>
            {c.free}
          </Link>
          <Link href="/pricing" onClick={onPricingClick}>
            {c.pricing}
          </Link>
        </section>
        <section>
          <h3>{c.support}</h3>
          <Link href="/suporte" onClick={onSupportClick}>
            {c.help}
          </Link>
          <a href={CONTACT_LINKS.supportMailto}>{c.email}</a>
          <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noreferrer">
            {c.whatsapp} ({CONTACTS.whatsappDisplay})
          </a>
        </section>
        <section>
          <h3>{c.legal}</h3>
          <Link href="/termos">{c.terms}</Link>
          <Link href="/privacidade">{c.privacy}</Link>
          <Link href="/seguranca">{c.security}</Link>
        </section>
      </div>
      <div className="site-footer-bottom">
        <span>© {year} SPECK TECH SOLUTIONS LTDA</span>
        <span>{c.rights}</span>
      </div>
    </footer>
  );
}
