"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LocaleToggle from "@/components/locale-toggle";
import { useLocale } from "@/components/locale";
import { useScrollDeck } from "@/components/use-scroll-deck";

type WaitlistFormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  useCase: string;
};

const INITIAL_FORM: WaitlistFormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  useCase: ""
};

const copy = {
  pt: {
    navProduct: "Produto",
    navFree: "Free",
    navAccess: "Acesso",
    backFree: "Voltar para Free",
    joinList: "Entrar na lista",
    badge: "LISTA DE INTERESSE",
    title: "Estamos iniciando a NEXO em ciclos pequenos. Entre na lista de interesse.",
    subtitle:
      "Ainda não estamos abrindo planos pagos. Primeiro queremos validar o produto com equipes reais e evoluir a área autenticada com foco no que realmente ajuda no trabalho diário.",
    whatYouGet: "Evoluções previstas na área autenticada",
    benefit1: "Integração com Git para importar e versionar documentos",
    benefit2: "Gerenciamento de equipes e permissões por workspace",
    benefit3: "Histórico completo dos documentos gerados",
    benefit4: "Contexto de PRs para registrar decisões de mudança",
    benefit5: "Visão de intervalos de commit para análise operacional",
    register: "Registrar interesse",
    name: "Nome",
    email: "E-mail de trabalho",
    company: "Empresa",
    role: "Cargo / função",
    useCase: "Contexto de uso (opcional)",
    useCasePlaceholder: "Ex.: operação técnica, gestão de mudanças, documentação executiva.",
    sending: "Enviando...",
    submit: "Quero entrar na lista",
    sendingStatus: "Enviando seu interesse...",
    success: "Cadastro registrado. Vamos avisar você quando abrirmos os acessos.",
    failPrefix: "Não foi possível registrar agora:",
    noteTitle: "Enquanto isso, use o Free",
    noteBody:
      "Você já pode validar o fluxo principal na home: importar markdown, anexar evidências e gerar PDF pronto para comunicação executiva.",
    testFree: "Testar Free novamente",
    pulseTitle: "Momento atual do produto",
    pulseBody:
      "Estamos em fase inicial. Vamos liberar acesso gradualmente e priorizar as evoluções mais úteis para times reais.",
    pulseItem1: "Sem promessa de data exata para todos",
    pulseItem2: "Convites enviados em lotes",
    pulseItem3: "Feedback dos primeiros usuários influencia roadmap"
  },
  en: {
    navProduct: "Product",
    navFree: "Free",
    navAccess: "Access",
    backFree: "Back to Free",
    joinList: "Join waitlist",
    badge: "INTEREST LIST",
    title: "We are starting NEXO in small rollout cycles. Join the interest list.",
    subtitle:
      "We are not launching paid plans yet. First we want to validate the product with real teams and evolve the authenticated area around practical daily needs.",
    whatYouGet: "Planned authenticated features",
    benefit1: "Git integration to import and version documents",
    benefit2: "Team management and workspace permissions",
    benefit3: "Full history of generated documents",
    benefit4: "PR context linked to change decisions",
    benefit5: "Commit interval visibility for operational analysis",
    register: "Register interest",
    name: "Name",
    email: "Work email",
    company: "Company",
    role: "Role / function",
    useCase: "Use case (optional)",
    useCasePlaceholder: "E.g. technical operations, change management, executive documentation.",
    sending: "Sending...",
    submit: "Join waitlist",
    sendingStatus: "Submitting your interest...",
    success: "Registration received. We will contact you when access opens.",
    failPrefix: "Could not register right now:",
    noteTitle: "Meanwhile, use Free",
    noteBody:
      "You can already validate the core flow on home: import markdown, attach evidence, and generate an executive-ready PDF.",
    testFree: "Try Free again",
    pulseTitle: "Current product stage",
    pulseBody:
      "We are still early-stage. Access will be released gradually while we prioritize the most useful improvements for real teams.",
    pulseItem1: "No fixed timeline promise for everyone",
    pulseItem2: "Invites are sent in batches",
    pulseItem3: "Early user feedback directly shapes the roadmap"
  }
} as const;

export default function PricingPage() {
  useScrollDeck();
  const { locale } = useLocale();
  const c = copy[locale];
  const [form, setForm] = useState<WaitlistFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(c.sendingStatus);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message ?? "waitlist_failed");
      }

      setStatus(c.success);
      setForm(INITIAL_FORM);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(`${c.failPrefix} ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="pricing-page motion-root">
      <header className="pricing-top motion rise-1">
        <div className="hero-brand">
          <img alt="NEXO" src="/brand/nexo_logo_primary.svg" />
          <strong>NEXO</strong>
        </div>
        <nav className="pricing-nav-links">
          <Link href="/#contexto">{c.navProduct}</Link>
          <Link href="/#free-converter">{c.navFree}</Link>
          <Link href="/pricing">{c.navAccess}</Link>
        </nav>
        <div className="hero-nav-actions">
          <LocaleToggle />
          <ThemeToggle />
          <Link className="btn-nav-ghost" href="/">
            {c.backFree}
          </Link>
          <a className="btn-nav-solid" href="#waitlist-form">
            {c.joinList}
          </a>
        </div>
      </header>

      <section className="pricing-hero-layout motion rise-2" data-deck-group>
        <div className="pricing-hero deck-card">
          <p className="hero-badge">{c.badge}</p>
          <h1>{c.title}</h1>
          <p>{c.subtitle}</p>
        </div>
        <aside className="pricing-pulse surface-lift deck-card">
          <p className="plan-name">{c.pulseTitle}</p>
          <p>{c.pulseBody}</p>
          <ul>
            <li>{c.pulseItem1}</li>
            <li>{c.pulseItem2}</li>
            <li>{c.pulseItem3}</li>
          </ul>
        </aside>
      </section>

      <div className="pricing-grid motion rise-3" data-deck-group>
        <article className="price-card surface-lift deck-card">
          <p className="plan-name">{c.whatYouGet}</p>
          <ul>
            <li>{c.benefit1}</li>
            <li>{c.benefit2}</li>
            <li>{c.benefit3}</li>
            <li>{c.benefit4}</li>
            <li>{c.benefit5}</li>
          </ul>
        </article>

        <form className="price-card price-card-highlight surface-lift waitlist-form deck-card" id="waitlist-form" onSubmit={onSubmit}>
          <p className="plan-name">{c.register}</p>

          <label htmlFor="waitlist-name">{c.name}</label>
          <input
            id="waitlist-name"
            className="waitlist-input"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            maxLength={120}
            required
          />

          <label htmlFor="waitlist-email">{c.email}</label>
          <input
            id="waitlist-email"
            className="waitlist-input"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            maxLength={180}
            required
          />

          <label htmlFor="waitlist-company">{c.company}</label>
          <input
            id="waitlist-company"
            className="waitlist-input"
            value={form.company}
            onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
            maxLength={120}
            required
          />

          <label htmlFor="waitlist-role">{c.role}</label>
          <input
            id="waitlist-role"
            className="waitlist-input"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            maxLength={120}
            required
          />

          <label htmlFor="waitlist-use-case">{c.useCase}</label>
          <textarea
            id="waitlist-use-case"
            rows={4}
            className="waitlist-textarea"
            value={form.useCase}
            onChange={(event) => setForm((prev) => ({ ...prev, useCase: event.target.value }))}
            maxLength={700}
            placeholder={c.useCasePlaceholder}
          />

          <button type="submit" className="plan-button" disabled={submitting}>
            {submitting ? c.sending : c.submit}
          </button>
          <small className="waitlist-status">{status}</small>
        </form>
      </div>

      <section className="pricing-note motion rise-3 deck-card">
        <h2>{c.noteTitle}</h2>
        <p>{c.noteBody}</p>
        <Link className="btn-cta-alt" href="/">
          {c.testFree}
        </Link>
      </section>
    </main>
  );
}
