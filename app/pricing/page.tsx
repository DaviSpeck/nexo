"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LocaleToggle from "@/components/locale-toggle";
import { useLocale } from "@/components/locale";
import { useScrollDeck } from "@/components/use-scroll-deck";
import { trackEvent } from "@/components/public-events";
import SiteFooter from "@/components/site-footer";

type WaitlistFormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  useCase: string;
};

type WaitlistField = keyof WaitlistFormState;
type WaitlistErrors = Partial<Record<WaitlistField, string>>;
type WaitlistTouched = Partial<Record<WaitlistField, boolean>>;

const INITIAL_FORM: WaitlistFormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  useCase: "",
};

const copy = {
  pt: {
    navProduct: "Produto",
    navHow: "Como funciona",
    navFree: "Teste grátis",
    navSupport: "Suporte",
    navPlans: "Planos",
    ctaWaitlist: "Entrar na lista",
    ctaTry: "Testar agora",
    badge: "LISTA DE INTERESSE",
    title:
      "Estamos iniciando a NEXO em ciclos pequenos. Entre na lista de interesse.",
    subtitle:
      "Ainda não estamos abrindo planos pagos. Primeiro queremos validar o produto com equipes reais e evoluir a área autenticada com foco no que realmente ajuda no trabalho diário.",
    heroTag1: "Acesso gradual",
    heroTag2: "Feedback orienta roadmap",
    heroTag3: "Free já disponível",
    whatYouGet: "Evoluções previstas na área autenticada",
    whatYouGetIntro: "O acesso completo entra depois. O que estamos preparando:",
    benefit1:
      "Repositório de arquivos .md com navegação tipo Drive para organizar documentos por time, pasta e contexto",
    benefit2:
      "Conversão em PDF direto dos markdowns já salvos no repositório, sem reupload manual",
    benefit3: "Integração com Git para importar e versionar documentos",
    benefit4: "Gerenciamento de equipes e permissões por workspace",
    benefit5: "Histórico completo dos documentos gerados",
    benefit6: "Contexto de PRs para registrar decisões de mudança",
    benefit7: "Visão de intervalos de commit para análise operacional",
    register: "Registrar interesse",
    name: "Nome",
    email: "E-mail de trabalho",
    company: "Empresa",
    role: "Cargo / função",
    useCase: "Contexto de uso (opcional)",
    useCasePlaceholder:
      "Ex.: operação técnica, gestão de mudanças, documentação executiva.",
    sending: "Enviando...",
    submit: "Quero entrar na lista",
    sendingStatus: "Enviando seu interesse...",
    success: "Cadastro registrado e e-mail de confirmação enviado.",
    failPrefix: "Não foi possível registrar agora:",
    fixFields: "Revise os campos destacados para continuar.",
    errNameRequired: "Informe seu nome completo.",
    errEmailRequired: "Informe um e-mail de trabalho.",
    errEmailInvalid: "Use um e-mail válido (ex.: nome@empresa.com).",
    errCompanyRequired: "Informe o nome da empresa.",
    errRoleRequired: "Informe seu cargo/função.",
    errUseCaseTooLong: "Contexto muito longo (máximo de 700 caracteres).",
    noteTitle: "Enquanto isso, use o Free",
    noteBody:
      "Você já pode validar o fluxo principal na home: importar markdown, anexar evidências e gerar PDF pronto para comunicação executiva.",
    noteStep1: "Suba um markdown",
    noteStep2: "Anexe evidências",
    noteStep3: "Gere o PDF",
    noteStep1Body: "Cole ou envie um `.md` com preview imediato.",
    noteStep2Body: "Inclua imagens para contexto técnico e executivo.",
    noteStep3Body: "Baixe um PDF estruturado para circulação.",
    testFree: "Testar Free novamente",
    pulseTitle: "Momento atual do produto",
    pulseBody:
      "Estamos em fase inicial. Vamos liberar acesso gradualmente e priorizar as evoluções mais úteis para times reais.",
    pulseLabel1: "Fase",
    pulseValue1: "Early access",
    pulseLabel2: "Convites",
    pulseValue2: "Em lotes",
    pulseLabel3: "Critério",
    pulseValue3: "Uso real",
    pulseItem1: "Sem promessa de data exata para todos",
    pulseItem2: "Convites enviados em lotes",
    pulseItem3: "Feedback dos primeiros usuários influencia roadmap",
  },
  en: {
    navProduct: "Product",
    navHow: "How it works",
    navFree: "Free trial",
    navSupport: "Support",
    navPlans: "Plans",
    ctaWaitlist: "Join waitlist",
    ctaTry: "Try now",
    badge: "INTEREST LIST",
    title:
      "We are starting NEXO in small rollout cycles. Join the interest list.",
    subtitle:
      "We are not launching paid plans yet. First we want to validate the product with real teams and evolve the authenticated area around practical daily needs.",
    heroTag1: "Gradual access",
    heroTag2: "Feedback shapes roadmap",
    heroTag3: "Free already available",
    whatYouGet: "Planned authenticated features",
    whatYouGetIntro: "Full access comes next. This is what we are preparing:",
    benefit1:
      "A .md repository with Drive-like navigation to organize documents by team, folder, and context",
    benefit2:
      "Direct PDF conversion from markdown files already stored in the repository, without manual re-upload",
    benefit3: "Git integration to import and version documents",
    benefit4: "Team management and workspace permissions",
    benefit5: "Full history of generated documents",
    benefit6: "PR context linked to change decisions",
    benefit7: "Commit interval visibility for operational analysis",
    register: "Register interest",
    name: "Name",
    email: "Work email",
    company: "Company",
    role: "Role / function",
    useCase: "Use case (optional)",
    useCasePlaceholder:
      "E.g. technical operations, change management, executive documentation.",
    sending: "Sending...",
    submit: "Join waitlist",
    sendingStatus: "Submitting your interest...",
    success: "Registration received and confirmation e-mail sent.",
    failPrefix: "Could not register right now:",
    fixFields: "Please review the highlighted fields to continue.",
    errNameRequired: "Please enter your full name.",
    errEmailRequired: "Please enter your work e-mail.",
    errEmailInvalid: "Use a valid e-mail (e.g. name@company.com).",
    errCompanyRequired: "Please enter your company name.",
    errRoleRequired: "Please enter your role.",
    errUseCaseTooLong: "Use case is too long (max 700 characters).",
    noteTitle: "Meanwhile, use Free",
    noteBody:
      "You can already validate the core flow on home: import markdown, attach evidence, and generate an executive-ready PDF.",
    noteStep1: "Upload markdown",
    noteStep2: "Attach evidence",
    noteStep3: "Generate PDF",
    noteStep1Body: "Paste or upload a `.md` file with instant preview.",
    noteStep2Body: "Add images for technical and executive context.",
    noteStep3Body: "Download a structured PDF ready to share.",
    testFree: "Try Free again",
    pulseTitle: "Current product stage",
    pulseBody:
      "We are still early-stage. Access will be released gradually while we prioritize the most useful improvements for real teams.",
    pulseLabel1: "Stage",
    pulseValue1: "Early access",
    pulseLabel2: "Invites",
    pulseValue2: "Batched",
    pulseLabel3: "Criteria",
    pulseValue3: "Real usage",
    pulseItem1: "No fixed timeline promise for everyone",
    pulseItem2: "Invites are sent in batches",
    pulseItem3: "Early user feedback directly shapes the roadmap",
  },
} as const;

export default function PricingPage() {
  useScrollDeck();
  const pathname = usePathname();
  const { locale } = useLocale();
  const c = copy[locale];
  const [form, setForm] = useState<WaitlistFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const [touched, setTouched] = useState<WaitlistTouched>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">(
    "neutral",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPricingActive = pathname === "/pricing";

  function validateField(field: WaitlistField, value: string): string {
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === "name" && trimmed.length < 2) {
      return c.errNameRequired;
    }

    if (field === "email") {
      if (trimmed.length === 0) {
        return c.errEmailRequired;
      }
      if (!emailRegex.test(trimmed)) {
        return c.errEmailInvalid;
      }
    }

    if (field === "company" && trimmed.length < 2) {
      return c.errCompanyRequired;
    }

    if (field === "role" && trimmed.length < 2) {
      return c.errRoleRequired;
    }

    if (field === "useCase" && trimmed.length > 700) {
      return c.errUseCaseTooLong;
    }

    return "";
  }

  function validateForm(values: WaitlistFormState): WaitlistErrors {
    const nextErrors: WaitlistErrors = {};

    (Object.keys(values) as WaitlistField[]).forEach((field) => {
      const message = validateField(field, values[field]);
      if (message) {
        nextErrors[field] = message;
      }
    });

    return nextErrors;
  }

  function onFieldChange(field: WaitlistField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const message = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: message || undefined }));
    }
  }

  function onFieldBlur(field: WaitlistField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const message = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: message || undefined }));
  }

  useEffect(() => {
    void trackEvent({
      eventName: "page_view",
      eventSource: "web_ui",
      path: "/pricing",
      payload: { page: "pricing" },
    });
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const onResize = () => {
      if (window.innerWidth >= 980) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileMenuOpen]);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setTouched({
        name: true,
        email: true,
        company: true,
        role: true,
        useCase: true,
      });
      setStatus(c.fixFields);
      setStatusTone("error");
      return;
    }

    setSubmitting(true);
    setStatus(c.sendingStatus);
    setStatusTone("neutral");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message ?? "waitlist_failed");
      }

      setStatus(c.success);
      setStatusTone("success");
      setForm(INITIAL_FORM);
      setErrors({});
      setTouched({});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";
      setStatus(`${c.failPrefix} ${message}`);
      setStatusTone("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="pricing-nav-shell motion rise-1">
        <header className="pricing-top hero-nav landing-nav">
          <Link href="/" className="hero-brand hero-brand-link">
            <img alt="NEXO" src="/brand/nexo_logo_primary.svg" />
            <strong>NEXO</strong>
          </Link>

          <button
            className="nav-menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="pricing-nav-links"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className={`landing-nav-panel ${mobileMenuOpen ? "is-open" : ""}`}
            id="pricing-nav-links"
          >
            <nav className="pricing-nav-links">
              <Link href="/" onClick={closeMenu}>
                {c.navProduct}
              </Link>
              <Link href="/#como-funciona" onClick={closeMenu}>
                {c.navHow}
              </Link>
              <Link href="/#free-converter" onClick={closeMenu}>
                {c.navFree}
              </Link>
              <Link href="/suporte" onClick={closeMenu}>
                {c.navSupport}
              </Link>
              <Link
                href="/pricing"
                className={isPricingActive ? "nav-link-active" : undefined}
                aria-current={isPricingActive ? "page" : undefined}
                onClick={closeMenu}
              >
                {c.navPlans}
              </Link>
            </nav>

            <div className="hero-nav-actions">
              <LocaleToggle />
              <ThemeToggle />
              <a className="btn-nav-ghost" href="#waitlist-form" onClick={closeMenu}>
                {c.ctaWaitlist}
              </a>
              <Link className="btn-nav-solid" href="/#free-converter" onClick={closeMenu}>
                {c.ctaTry}
              </Link>
            </div>
          </div>
        </header>
      </div>

      <main className="pricing-page motion-root">
        <section className="pricing-hero-layout motion rise-2" data-deck-group>
          <div className="pricing-hero deck-card">
            <p className="hero-badge">{c.badge}</p>
            <h1>{c.title}</h1>
            <p>{c.subtitle}</p>
            <div className="pricing-hero-tags">
              <span>{c.heroTag1}</span>
              <span>{c.heroTag2}</span>
              <span>{c.heroTag3}</span>
            </div>
          </div>
          <aside className="pricing-pulse surface-lift deck-card">
            <p className="plan-name">{c.pulseTitle}</p>
            <p>{c.pulseBody}</p>
            <div className="pricing-pulse-stats">
              <article>
                <small>{c.pulseLabel1}</small>
                <strong>{c.pulseValue1}</strong>
              </article>
              <article>
                <small>{c.pulseLabel2}</small>
                <strong>{c.pulseValue2}</strong>
              </article>
              <article>
                <small>{c.pulseLabel3}</small>
                <strong>{c.pulseValue3}</strong>
              </article>
            </div>
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
            <p className="pricing-card-intro">{c.whatYouGetIntro}</p>
            <div className="pricing-feature-list">
              <article className="pricing-feature-item">
                <strong>{c.benefit1}</strong>
              </article>
              <article className="pricing-feature-item">
                <strong>{c.benefit2}</strong>
              </article>
              <article className="pricing-feature-item">
                <strong>{c.benefit3}</strong>
              </article>
              <article className="pricing-feature-item">
                <strong>{c.benefit4}</strong>
              </article>
              <article className="pricing-feature-item">
                <strong>{c.benefit5}</strong>
              </article>
              <article className="pricing-feature-item">
                <strong>{c.benefit6}</strong>
              </article>
              <article className="pricing-feature-item">
                <strong>{c.benefit7}</strong>
              </article>
            </div>
          </article>

          <form
            className="price-card price-card-highlight surface-lift waitlist-form deck-card"
            id="waitlist-form"
            onSubmit={onSubmit}
            noValidate
          >
            <p className="plan-name">{c.register}</p>

            <div className="form-field">
              <label htmlFor="waitlist-name">{c.name}</label>
              <input
                id="waitlist-name"
                className={`waitlist-input ${errors.name ? "waitlist-input-invalid" : ""}`}
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                onBlur={() => onFieldBlur("name")}
                maxLength={120}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "waitlist-name-error" : undefined
                }
              />
              <small
                id="waitlist-name-error"
                className={`waitlist-error ${errors.name ? "waitlist-error-visible" : ""}`}
              >
                {errors.name ?? ""}
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="waitlist-email">{c.email}</label>
              <input
                id="waitlist-email"
                className={`waitlist-input ${errors.email ? "waitlist-input-invalid" : ""}`}
                type="email"
                value={form.email}
                onChange={(event) => onFieldChange("email", event.target.value)}
                onBlur={() => onFieldBlur("email")}
                maxLength={180}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "waitlist-email-error" : undefined
                }
              />
              <small
                id="waitlist-email-error"
                className={`waitlist-error ${errors.email ? "waitlist-error-visible" : ""}`}
              >
                {errors.email ?? ""}
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="waitlist-company">{c.company}</label>
              <input
                id="waitlist-company"
                className={`waitlist-input ${errors.company ? "waitlist-input-invalid" : ""}`}
                value={form.company}
                onChange={(event) =>
                  onFieldChange("company", event.target.value)
                }
                onBlur={() => onFieldBlur("company")}
                maxLength={120}
                aria-invalid={Boolean(errors.company)}
                aria-describedby={
                  errors.company ? "waitlist-company-error" : undefined
                }
              />
              <small
                id="waitlist-company-error"
                className={`waitlist-error ${errors.company ? "waitlist-error-visible" : ""}`}
              >
                {errors.company ?? ""}
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="waitlist-role">{c.role}</label>
              <input
                id="waitlist-role"
                className={`waitlist-input ${errors.role ? "waitlist-input-invalid" : ""}`}
                value={form.role}
                onChange={(event) => onFieldChange("role", event.target.value)}
                onBlur={() => onFieldBlur("role")}
                maxLength={120}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={
                  errors.role ? "waitlist-role-error" : undefined
                }
              />
              <small
                id="waitlist-role-error"
                className={`waitlist-error ${errors.role ? "waitlist-error-visible" : ""}`}
              >
                {errors.role ?? ""}
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="waitlist-use-case">{c.useCase}</label>
              <textarea
                id="waitlist-use-case"
                rows={4}
                className={`waitlist-textarea ${errors.useCase ? "waitlist-input-invalid" : ""}`}
                value={form.useCase}
                onChange={(event) =>
                  onFieldChange("useCase", event.target.value)
                }
                onBlur={() => onFieldBlur("useCase")}
                maxLength={700}
                placeholder={c.useCasePlaceholder}
                aria-invalid={Boolean(errors.useCase)}
                aria-describedby={
                  errors.useCase ? "waitlist-use-case-error" : undefined
                }
              />
              <small
                id="waitlist-use-case-error"
                className={`waitlist-error ${errors.useCase ? "waitlist-error-visible" : ""}`}
              >
                {errors.useCase ?? ""}
              </small>
            </div>

            <button type="submit" className="plan-button" disabled={submitting}>
              {submitting ? c.sending : c.submit}
            </button>
            <small className={`waitlist-status waitlist-status-${statusTone}`}>
              {status}
            </small>
          </form>
        </div>

        <section className="pricing-note motion rise-3 deck-card">
          <div className="pricing-note-head">
            <div>
              <h2>{c.noteTitle}</h2>
              <p>{c.noteBody}</p>
            </div>
            <Link className="btn-cta-alt pricing-note-cta" href="/">
              {c.testFree}
            </Link>
          </div>

          <div className="pricing-note-steps" data-deck-group>
            <article className="deck-card pricing-note-step">
              <span>01</span>
              <strong>{c.noteStep1}</strong>
              <p>{c.noteStep1Body}</p>
            </article>
            <article className="deck-card pricing-note-step">
              <span>02</span>
              <strong>{c.noteStep2}</strong>
              <p>{c.noteStep2Body}</p>
            </article>
            <article className="deck-card pricing-note-step">
              <span>03</span>
              <strong>{c.noteStep3}</strong>
              <p>{c.noteStep3Body}</p>
            </article>
          </div>
        </section>
      </main>
      <div className="page-footer-wrap">
        <SiteFooter />
      </div>
    </>
  );
}
