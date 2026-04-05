"use client";

import MarkdownIt from "markdown-it";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import LocaleToggle from "@/components/locale-toggle";
import { useLocale } from "@/components/locale";
import { trackEvent } from "@/components/public-events";
import SiteFooter from "@/components/site-footer";
import ThemeToggle from "@/components/theme-toggle";
import { useScrollDeck } from "@/components/use-scroll-deck";
import { FREE_LIMITS, formatBytes } from "@/lib/config/free-limits";
import { EXAMPLE_DOCUMENTS } from "@/lib/example-documents";
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, getSiteUrl } from "@/lib/site-metadata";

type AttachmentPayload = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
};

type AttachmentPreview = AttachmentPayload & {
  id: string;
  sizeBytes?: number;
};

type LogoPreview = AttachmentPreview;
type LogoTone = "dark" | "light";
type MarkdownDocument = {
  id: string;
  fileName: string;
  markdown: string;
  attachments: AttachmentPreview[];
};

type StatusKind = "neutral" | "success" | "error" | "loading";

const previewMarkdownParser = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: true,
  tables: true,
});

const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NEXO",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: getSiteUrl(),
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS.join(", "),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  }
};

const copy = {
  pt: {
    navProduct: "Produto",
    navHow: "Como funciona",
    navFree: "Teste grátis",
    navCli: "CLI",
    navPlans: "Planos",
    navSupport: "Suporte",
    ctaPrimary: "Testar agora",
    ctaSecondary: "Ver como funciona",
    ctaWaitlist: "Entrar na lista",
    ctaPlans: "Ver planos",
    heroBadge: "Markdown para PDF institucional em minutos",
    heroTitle: "Transforme documentos técnicos em PDFs executivos sem retrabalho.",
    heroCopy:
      "A NEXO pega markdown gerado por times ou IA, organiza a narrativa e entrega um PDF padronizado, claro e pronto para circulação institucional.",
    heroValue1: "Fluxo sem login no modo Free",
    heroValue2: "Preview antes da geração",
    heroValue3: "Nenhum conteúdo salvo no servidor",
    heroFlowLabel: "Fluxo real",
    heroFlowTitle: "Markdown -> revisão -> PDF institucional",
    heroFlowCopy:
      "Suba o `.md`, anexe evidências, revise o conteúdo e gere um documento estruturado para compartilhar com liderança e operação.",
    heroMockInput: "Entrada técnica",
    heroMockOutput: "Saída pronta para circular",
    heroMockStep1: "Objetivo, contexto e impacto",
    heroMockStep2: "Risco, rollback e responsáveis",
    heroMockStep3: "Evidências visuais anexadas",
    trustLabel: "Uso imediato",
    trustValue: "Sem login",
    problemKicker: "Problema",
    problemTitle:
      "Markdown acelera a produção, mas não resolve sozinho a comunicação institucional.",
    problemCopy:
      "Quando decisão, risco e evidências ficam espalhados, o time perde contexto, a liderança perde clareza e o PDF final vira trabalho manual.",
    problem1t: "Decisão fragmentada",
    problem1d:
      "Aprovações e contexto ficam dispersos entre documentos, chats e ferramentas.",
    problem2t: "PDF inconsistente",
    problem2d:
      "Cada documento sai com formato diferente e exige ajuste manual antes de circular.",
    problem3t: "Baixa confiança operacional",
    problem3d:
      "Sem padrão, risco, rollback e responsáveis não ficam claros para quem executa.",
    solutionKicker: "Solução",
    solutionTitle: "Um fluxo simples para sair do markdown e chegar num documento executivo.",
    solutionCopy:
      "A landing passa a guiar o usuário pelo raciocínio completo: problema, solução, teste imediato, planos e suporte.",
    stepsTitle: "Como funciona",
    step1t: "1. Suba o markdown",
    step1d: "Aceita arquivos `.md` e texto gerado por IA com preview imediato.",
    step2t: "2. Adicione evidências",
    step2d: "Inclua imagens que reforçam o contexto técnico ou operacional.",
    step3t: "3. Gere o PDF",
    step3d: "Receba um PDF estruturado, com melhor leitura e padrão institucional.",
    productKicker: "Produto",
    productTitle: "Feito para comunicação clara entre operação, produto e liderança.",
    productCopy:
      "A home prioriza um CTA principal, reduz decisão paralela e mostra o produto antes de pedir compromisso.",
    productStat1: "CTA principal único acima da dobra",
    productStat2: "Preview visual do fluxo markdown -> PDF",
    productStat3: "Conversor com feedback de upload, progresso e confirmação",
    benefitsKicker: "Benefícios",
    benefitsTitle: "Mais entendimento em menos tempo.",
    benefit1t: "Padronização imediata",
    benefit1d:
      "O documento sai com estrutura consistente mesmo quando a origem veio de markdown gerado por IA.",
    benefit2t: "Leitura executiva",
    benefit2d:
      "Texto, evidências e decisões ficam mais fáceis de escanear em desktop e mobile.",
    benefit3t: "Privacidade no modo Free",
    benefit3d:
      "Processamento temporário durante a sessão, sem persistir conteúdo do arquivo ou anexos.",
    examplesKicker: "Exemplos reais",
    examplesTitle: "Teste com exemplos reais.",
    examplesCopy:
      "Use um exemplo no conversor ou baixe o PDF final para avaliar a saída.",
    examplesUse: "Usar no conversor",
    examplesDownloadPdf: "Baixar PDF",
    freeKicker: "Free Converter",
    freeTitle: "Teste agora e valide o fluxo completo sem login",
    freeSubtitle:
      "Suba markdown, anexe evidências, revise o preview e gere um PDF estruturado em poucos minutos.",
    freeSecurityTitle: "Privacidade e limites do modo Free",
    freeSecurity1: "Nenhum conteúdo do markdown é salvo.",
    freeSecurity2: "As imagens não ficam armazenadas após a geração.",
    freeSecurity3: "Processamento temporário durante a sessão.",
    freeSecurity4: "Só registramos eventos técnicos de uso para medir a experiência.",
    docsLabel: "Documentos markdown",
    docsHelper:
      "Até 3 documentos por geração. Cada documento mantém seus próprios anexos.",
    docsAdd: "Adicionar documento",
    docsRemove: "Remover documento",
    docsLimitReached: "Limite de documentos atingido no modo Free.",
    docsTotalChars: "Total do pacote",
    docsActive: "Documento ativo",
    docsAttachmentsHint: "Os anexos abaixo pertencem apenas ao documento ativo.",
    docsPreviewHint: "O preview mostra como o PDF final será diagramado.",
    docDefaultName: "documento",
    docUntitled: "Documento sem nome",
    noMdYet: "Nenhum markdown carregado ainda.",
    previewEmpty:
      "Envie um arquivo .md ou cole conteúdo para visualizar a composição do PDF.",
    mdLabel: "Arquivo markdown (.md)",
    mdDrop: "Toque para selecionar ou arraste um arquivo `.md`",
    mdDragging: "Solte o arquivo para importar",
    mdCurrent: "Arquivo atual",
    mdImporting: "Importando markdown",
    mdReady: "Markdown carregado",
    imgLabel: "Imagens para evidências (opcional)",
    imgDrop: "Adicione PNG, JPG ou WEBP com drag and drop",
    imgDragging: "Solte as imagens para anexar",
    attachmentsSelected: "anexos selecionados",
    imgImporting: "Importando anexos",
    noAttachment: "Nenhuma evidência anexada.",
    logoLabel: "Logo do documento (opcional)",
    logoDrop: "Adicione PNG, JPG, WEBP ou SVG para personalizar o PDF",
    logoDragging: "Solte a logo para usar no documento",
    logoSelected: "Logo selecionada",
    logoHint:
      "A logo aparece no preview e no PDF final, mantendo os elementos visuais da NEXO.",
    logoToneLabel: "Variante de fundo da marca",
    logoToneDark: "Fundo escuro",
    logoToneDarkHint: "Ideal para logos claras.",
    logoToneLight: "Fundo claro",
    logoToneLightHint: "Ideal para logos escuras.",
    removeLogo: "Remover logo",
    previewBrandTitle: "Cabeçalho do PDF",
    previewBrandNexo: "NEXO permanece como assinatura da ferramenta",
    previewBrandClient: "Marca personalizada do documento",
    remove: "Remover",
    contentMd: "Conteúdo markdown",
    previewTitle: "Preview do PDF",
    previewOpen: "Abrir preview",
    previewExpand: "Expandir preview",
    previewClose: "Fechar preview",
    limits: "Limites",
    generate: "Gerar PDF",
    generateMany: "Gerar PDFs",
    converting: "Gerando PDF...",
    convertingMany: "Gerando PDFs...",
    genProgress: "Progresso da geração",
    statusReady: "Pronto para converter.",
    generatedTitle: "PDF pronto para download",
    generatedCopy: "Arquivo gerado com sucesso e baixado automaticamente.",
    generatedManyTitle: "PDFs prontos para download",
    generatedManyCopy: "Arquivos gerados com sucesso e downloads iniciados automaticamente.",
    plansKicker: "Planos e acesso",
    plansTitle: "Comece no Free e avance para governança completa quando fizer sentido.",
    plansCopy:
      "O Free converte e valida o fluxo. Os planos pagos adicionam histórico, colaboração, templates e governança do time.",
    plansNote: "Interessado no acesso completo? Entre na lista para receber atualizações.",
    supportKicker: "Suporte e confiança",
    supportTitle: "Comunicação institucional com clareza, suporte e privacidade explícita.",
    supportCopy:
      "A página reforça o posicionamento do produto e deixa evidente que o modo Free não persiste conteúdo.",
    supportPoint1: "Nenhum conteúdo é salvo no modo Free",
    supportPoint2: "Preview estável, sem quebrar o layout em mobile",
    supportPoint3: "Apoio para dúvidas comerciais, suporte e segurança",
    supportCta: "Falar com suporte",
    pricingCardTitle: "Acesso completo",
    pricingCardBody:
      "Histórico, colaboração, templates e controles para o time operar com governança.",
    waitlistCardTitle: "Lista de acesso",
    waitlistCardBody:
      "Receba novidades sobre acesso, planos e evolução do produto sem atrito.",
    stickyCta: "Testar agora",
  },
  en: {
    navProduct: "Product",
    navHow: "How it works",
    navFree: "Free trial",
    navCli: "CLI",
    navPlans: "Plans",
    navSupport: "Support",
    ctaPrimary: "Try now",
    ctaSecondary: "See how it works",
    ctaWaitlist: "Join the waitlist",
    ctaPlans: "View plans",
    heroBadge: "Markdown to institutional PDF in minutes",
    heroTitle: "Turn technical documents into executive PDFs without rework.",
    heroCopy:
      "NEXO takes markdown written by teams or AI, organizes the narrative, and delivers a standardized PDF ready for institutional circulation.",
    heroValue1: "No-login flow in Free mode",
    heroValue2: "Preview before generation",
    heroValue3: "No content stored on the server",
    heroFlowLabel: "Real workflow",
    heroFlowTitle: "Markdown -> review -> institutional PDF",
    heroFlowCopy:
      "Upload the `.md`, attach evidence, review the content, and generate a structured document for leadership and operations.",
    heroMockInput: "Technical input",
    heroMockOutput: "Share-ready output",
    heroMockStep1: "Objective, context, and impact",
    heroMockStep2: "Risk, rollback, and owners",
    heroMockStep3: "Visual evidence appended",
    trustLabel: "Instant use",
    trustValue: "No login",
    problemKicker: "Problem",
    problemTitle:
      "Markdown speeds up drafting, but it does not solve institutional communication on its own.",
    problemCopy:
      "When decisions, risk, and evidence stay scattered, teams lose context, leadership loses clarity, and the final PDF becomes manual work.",
    problem1t: "Fragmented decisions",
    problem1d:
      "Approvals and context get split across docs, chats, and tools.",
    problem2t: "Inconsistent PDF output",
    problem2d:
      "Every document ships with a different structure and needs manual cleanup.",
    problem3t: "Lower operational confidence",
    problem3d:
      "Without a standard, risk, rollback, and ownership are unclear for execution.",
    solutionKicker: "Solution",
    solutionTitle: "A simple flow from markdown draft to executive document.",
    solutionCopy:
      "The page now guides the user through the full story: problem, solution, immediate trial, plans, and support.",
    stepsTitle: "How it works",
    step1t: "1. Upload markdown",
    step1d: "Accepts `.md` files and AI-generated text with instant preview.",
    step2t: "2. Add evidence",
    step2d: "Include images that reinforce technical or operational context.",
    step3t: "3. Generate PDF",
    step3d: "Get a structured PDF with clearer reading and institutional formatting.",
    productKicker: "Product",
    productTitle: "Built for clear communication across operations, product, and leadership.",
    productCopy:
      "The homepage now prioritizes one main CTA, reduces competing decisions, and shows the product before asking for commitment.",
    productStat1: "Single primary CTA above the fold",
    productStat2: "Visual markdown -> PDF flow preview",
    productStat3: "Converter with upload feedback, progress, and confirmation",
    benefitsKicker: "Benefits",
    benefitsTitle: "Faster understanding, less friction.",
    benefit1t: "Immediate standardization",
    benefit1d:
      "Documents keep a consistent structure even when the source is AI-generated markdown.",
    benefit2t: "Executive readability",
    benefit2d:
      "Text, evidence, and decisions become easier to scan on desktop and mobile.",
    benefit3t: "Privacy in Free mode",
    benefit3d:
      "Temporary processing during the session, without persisting file or attachment contents.",
    examplesKicker: "Real examples",
    examplesTitle: "Try real examples.",
    examplesCopy:
      "Load a sample into the converter or download the final PDF to inspect output quality.",
    examplesUse: "Use in converter",
    examplesDownloadPdf: "Download PDF",
    freeKicker: "Free Converter",
    freeTitle: "Try the full flow now without login",
    freeSubtitle:
      "Upload markdown, attach evidence, review the preview, and generate a structured PDF in minutes.",
    freeSecurityTitle: "Privacy and limits in Free mode",
    freeSecurity1: "No markdown content is saved.",
    freeSecurity2: "Images are not stored after generation.",
    freeSecurity3: "Temporary processing during the session.",
    freeSecurity4: "We only log technical usage events to measure the experience.",
    docsLabel: "Markdown documents",
    docsHelper:
      "Up to 3 documents per run. Each document keeps its own attachments.",
    docsAdd: "Add document",
    docsRemove: "Remove document",
    docsLimitReached: "Document limit reached in Free mode.",
    docsTotalChars: "Bundle total",
    docsActive: "Active document",
    docsAttachmentsHint: "Attachments below belong only to the active document.",
    docsPreviewHint: "The preview shows how the final PDF will be laid out.",
    docDefaultName: "document",
    docUntitled: "Untitled document",
    noMdYet: "No markdown loaded yet.",
    previewEmpty:
      "Upload a .md file or paste content to preview the PDF composition.",
    mdLabel: "Markdown file (.md)",
    mdDrop: "Tap to select or drag a `.md` file",
    mdDragging: "Drop the file to import",
    mdCurrent: "Current file",
    mdImporting: "Importing markdown",
    mdReady: "Markdown loaded",
    imgLabel: "Images for evidence (optional)",
    imgDrop: "Add PNG, JPG, or WEBP with drag and drop",
    imgDragging: "Drop images to attach",
    attachmentsSelected: "attachments selected",
    imgImporting: "Importing attachments",
    noAttachment: "No evidence attached.",
    logoLabel: "Document logo (optional)",
    logoDrop: "Add PNG, JPG, WEBP, or SVG to personalize the PDF",
    logoDragging: "Drop the logo to use it in the document",
    logoSelected: "Selected logo",
    logoHint:
      "The logo appears in the preview and final PDF while keeping NEXO visual elements.",
    logoToneLabel: "Brand background variant",
    logoToneDark: "Dark surface",
    logoToneDarkHint: "Best for light logos.",
    logoToneLight: "Light surface",
    logoToneLightHint: "Best for dark logos.",
    removeLogo: "Remove logo",
    previewBrandTitle: "PDF header",
    previewBrandNexo: "NEXO remains as the product signature",
    previewBrandClient: "Custom document brand",
    remove: "Remove",
    contentMd: "Markdown content",
    previewTitle: "PDF preview",
    previewOpen: "Open preview",
    previewExpand: "Expand preview",
    previewClose: "Close preview",
    limits: "Limits",
    generate: "Generate PDF",
    generateMany: "Generate PDFs",
    converting: "Generating PDF...",
    convertingMany: "Generating PDFs...",
    genProgress: "Generation progress",
    statusReady: "Ready to convert.",
    generatedTitle: "PDF ready to download",
    generatedCopy: "File generated successfully and downloaded automatically.",
    generatedManyTitle: "PDFs ready to download",
    generatedManyCopy: "Files generated successfully and downloads started automatically.",
    plansKicker: "Plans and access",
    plansTitle: "Start in Free and move to full governance when it makes sense.",
    plansCopy:
      "Free validates the workflow. Paid plans add history, collaboration, templates, and team governance.",
    plansNote: "Interested in full access? Join the waitlist to receive updates.",
    supportKicker: "Support and trust",
    supportTitle: "Institutional communication with clarity, support, and explicit privacy.",
    supportCopy:
      "The page reinforces product positioning and makes it clear that Free mode does not persist content.",
    supportPoint1: "No content is saved in Free mode",
    supportPoint2: "Stable preview without breaking the mobile layout",
    supportPoint3: "Support for commercial, product, and security questions",
    supportCta: "Talk to support",
    pricingCardTitle: "Full access",
    pricingCardBody:
      "History, collaboration, templates, and controls for team governance.",
    waitlistCardTitle: "Access waitlist",
    waitlistCardBody:
      "Receive updates about access, plans, and product evolution with low friction.",
    stickyCta: "Try now",
  },
} as const;

function readFileAsDataUrl(file: File, onProgress?: (percent: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      onProgress?.(100);
      resolve(String(reader.result));
    };

    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      onProgress?.(
        Math.min(100, Math.round((event.loaded / event.total) * 100)),
      );
    };

    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File, onProgress?: (percent: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      onProgress?.(100);
      resolve(String(reader.result));
    };

    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      onProgress?.(
        Math.min(100, Math.round((event.loaded / event.total) * 100)),
      );
    };

    reader.readAsText(file);
  });
}

function inferMimeType(file: File) {
  const explicit = file.type.toLowerCase().split(";")[0].trim();
  if (explicit) {
    if (explicit === "image/jpg") {
      return "image/jpeg";
    }
    if (explicit === "image/svg") {
      return "image/svg+xml";
    }
    return explicit;
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (lowerName.endsWith(".png")) {
    return "image/png";
  }
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lowerName.endsWith(".webp")) {
    return "image/webp";
  }

  return "application/octet-stream";
}

function getAttachmentSizeBytes(attachment: AttachmentPreview) {
  if (
    typeof attachment.sizeBytes === "number" &&
    Number.isFinite(attachment.sizeBytes) &&
    attachment.sizeBytes >= 0
  ) {
    return attachment.sizeBytes;
  }

  const match = /^data:[^;,]+;base64,([A-Za-z0-9+/=]+)$/.exec(
    attachment.dataUrl,
  );
  if (!match) {
    return 0;
  }

  const base64 = match[1];
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function createDocumentDraft(fileName = "comunicado-operacional.md"): MarkdownDocument {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName,
    markdown: "",
    attachments: [],
  };
}

export default function HomePage() {
  useScrollDeck();
  const pathname = usePathname();
  const { locale } = useLocale();
  const c = copy[locale];
  const formatLocale = locale === "pt" ? "pt-BR" : "en-US";
  const isHomeActive = pathname === "/";

  const [documents, setDocuments] = useState<MarkdownDocument[]>(() => {
    const initialDocument = createDocumentDraft();
    return [initialDocument];
  });
  const [activeDocumentId, setActiveDocumentId] = useState<string>("");
  const [customLogo, setCustomLogo] = useState<LogoPreview | null>(null);
  const [customLogoTone, setCustomLogoTone] = useState<LogoTone>("light");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(c.statusReady);
  const [statusKind, setStatusKind] = useState<StatusKind>("neutral");
  const [mdImportProgress, setMdImportProgress] = useState<number | null>(null);
  const [attachmentsImportProgress, setAttachmentsImportProgress] = useState<
    number | null
  >(null);
  const [logoImportProgress, setLogoImportProgress] = useState<number | null>(
    null,
  );
  const [convertProgress, setConvertProgress] = useState<number | null>(null);
  const [isMdDragOver, setIsMdDragOver] = useState(false);
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [isLogoDragOver, setIsLogoDragOver] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [lastGeneratedFile, setLastGeneratedFile] = useState<string | null>(
    null,
  );

  const markdownInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const trackedScroll50Ref = useRef(false);
  const trackedScroll90Ref = useRef(false);

  const activeDocument =
    documents.find((item) => item.id === activeDocumentId) ?? documents[0];
  const markdown = activeDocument?.markdown ?? "";
  const fileName = activeDocument?.fileName ?? "comunicado-operacional.md";
  const attachments = activeDocument?.attachments ?? [];
  const previewHtml = markdown.trim()
    ? previewMarkdownParser.render(markdown)
    : "";

  const markdownLength = markdown.length;
  const totalMarkdownChars = documents.reduce(
    (sum, item) => sum + item.markdown.length,
    0,
  );
  const markdownNearLimit =
    markdownLength > Math.floor(FREE_LIMITS.markdown.maxChars * 0.9);
  const totalAttachmentBytes = documents.reduce(
    (sum, document) =>
      sum +
      document.attachments.reduce(
        (docSum, item) => docSum + getAttachmentSizeBytes(item),
        0,
      ),
    0,
  );

  function updateStatus(message: string, kind: StatusKind = "neutral") {
    setStatusMessage(message);
    setStatusKind(kind);
  }

  function trackHomeEvent(eventName: string, payload?: Record<string, unknown>) {
    void trackEvent({
      eventName,
      eventSource: "web_ui",
      path: "/",
      payload: { page: "home", ...(payload ?? {}) },
    });
  }

  useEffect(() => {
    trackHomeEvent("page_view");
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        return;
      }

      const progress = window.scrollY / maxScroll;

      if (!trackedScroll50Ref.current && progress >= 0.5) {
        trackedScroll50Ref.current = true;
        trackHomeEvent("scroll_50");
      }

      if (!trackedScroll90Ref.current && progress >= 0.9) {
        trackedScroll90Ref.current = true;
        trackHomeEvent("scroll_90");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    updateStatus(c.statusReady, "neutral");
    setLastGeneratedFile(null);
  }, [locale]);

  useEffect(() => {
    if (!documents.some((item) => item.id === activeDocumentId)) {
      setActiveDocumentId(documents[0]?.id ?? "");
    }
  }, [activeDocumentId, documents]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 980) {
        setMobileMenuOpen(false);
        setPreviewModalOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const shouldLockScroll = mobileMenuOpen || previewModalOpen || previewExpanded;

    if (!shouldLockScroll) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen, previewExpanded, previewModalOpen]);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  function loadExample(slug: string) {
    const example = EXAMPLE_DOCUMENTS.find((item) => item.slug === slug);
    if (!example || !activeDocument) {
      return;
    }

    updateActiveDocument((document) => ({
      ...document,
      fileName: example.fileName,
      markdown: example.markdown,
      attachments: [],
    }));
    setLastGeneratedFile(null);
    updateStatus(
      locale === "pt"
        ? `Exemplo carregado: ${example.title.pt}`
        : `Example loaded: ${example.title.en}`,
      "success",
    );
    trackHomeEvent("load_example", { slug });
  }

  function updateActiveDocument(
    updater: (document: MarkdownDocument) => MarkdownDocument,
  ) {
    if (!activeDocument) {
      return;
    }

    setDocuments((prev) =>
      prev.map((item) => (item.id === activeDocument.id ? updater(item) : item)),
    );
  }

  function addDocument() {
    if (documents.length >= FREE_LIMITS.documents.maxFiles) {
      updateStatus(c.docsLimitReached, "error");
      return;
    }

    const nextDocument = createDocumentDraft(
      `${c.docDefaultName}-${documents.length + 1}.md`,
    );
    setDocuments((prev) => [...prev, nextDocument]);
    setActiveDocumentId(nextDocument.id);
    updateStatus(
      locale === "pt"
        ? `Documento ${documents.length + 1} adicionado.`
        : `Document ${documents.length + 1} added.`,
      "success",
    );
  }

  function removeDocument(documentId: string) {
    if (documents.length <= 1) {
      return;
    }

    setDocuments((prev) => prev.filter((item) => item.id !== documentId));
    if (activeDocumentId === documentId) {
      const fallback = documents.find((item) => item.id !== documentId);
      setActiveDocumentId(fallback?.id ?? "");
    }
  }

  async function handleMarkdownFile(file: File) {
    if (!file || !activeDocument) {
      return;
    }

    setMdImportProgress(0);
    updateStatus(`${c.mdImporting}: ${file.name}`, "loading");

    try {
      const text = await readFileAsText(file, setMdImportProgress);
      if (text.length > FREE_LIMITS.markdown.maxChars) {
        updateStatus(
          locale === "pt"
            ? `Markdown excede o limite de ${FREE_LIMITS.markdown.maxChars.toLocaleString("pt-BR")} caracteres.`
            : `Markdown exceeds the limit of ${FREE_LIMITS.markdown.maxChars.toLocaleString("en-US")} characters.`,
          "error",
        );
        setMdImportProgress(null);
        return;
      }

      updateActiveDocument((document) => ({
        ...document,
        markdown: text,
        fileName: file.name,
      }));
      setMdImportProgress(100);
      updateStatus(`${c.mdReady}: ${file.name}`, "success");
      trackHomeEvent("upload_markdown", {
        file_name: file.name,
        size_bytes: file.size,
        document_id: activeDocument.id,
      });
      window.setTimeout(() => setMdImportProgress(null), 700);
    } catch {
      updateStatus(
        locale === "pt"
          ? "Falha ao importar o arquivo markdown."
          : "Failed to import markdown file.",
        "error",
      );
      setMdImportProgress(null);
    }
  }

  async function handleAttachmentFiles(files: File[]) {
    if (files.length === 0 || !activeDocument) {
      return;
    }

    const totalAttachmentCount = documents.reduce(
      (sum, document) => sum + document.attachments.length,
      0,
    );
    if (totalAttachmentCount >= FREE_LIMITS.attachments.maxFiles) {
      updateStatus(
        locale === "pt"
          ? `Limite total de ${FREE_LIMITS.attachments.maxFiles} anexos atingido.`
          : `Total limit of ${FREE_LIMITS.attachments.maxFiles} attachments reached.`,
        "error",
      );
      return;
    }

    const remainingSlots =
      Math.min(
        FREE_LIMITS.attachments.maxFilesPerDocument - attachments.length,
        FREE_LIMITS.attachments.maxFiles - totalAttachmentCount,
      );
    if (remainingSlots <= 0) {
      updateStatus(
        locale === "pt"
          ? `Limite de ${FREE_LIMITS.attachments.maxFilesPerDocument} anexos neste documento.`
          : `Limit of ${FREE_LIMITS.attachments.maxFilesPerDocument} attachments in this document.`,
        "error",
      );
      return;
    }

    const selected = files.slice(0, remainingSlots);
    const rejected: string[] = [];
    const acceptedFiles = selected.filter((file) => {
      const mimeType = inferMimeType(file);
      if (
        !FREE_LIMITS.attachments.allowedMimeTypes.includes(
          mimeType as (typeof FREE_LIMITS.attachments.allowedMimeTypes)[number],
        )
      ) {
        rejected.push(
          locale === "pt"
            ? `${file.name} (tipo não permitido)`
            : `${file.name} (unsupported type)`,
        );
        return false;
      }

      if (file.size > FREE_LIMITS.attachments.maxFileBytes) {
        rejected.push(
          locale === "pt"
            ? `${file.name} (acima de ${formatBytes(FREE_LIMITS.attachments.maxFileBytes)})`
            : `${file.name} (over ${formatBytes(FREE_LIMITS.attachments.maxFileBytes)})`,
        );
        return false;
      }

      return true;
    });

    const nextTotalBytes = acceptedFiles.reduce(
      (sum, file) => sum + file.size,
      totalAttachmentBytes,
    );
    if (nextTotalBytes > FREE_LIMITS.attachments.maxTotalBytes) {
      updateStatus(
        locale === "pt"
          ? `Total de anexos excede ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}. Remova arquivos e tente novamente.`
          : `Total attachments exceed ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}. Remove files and try again.`,
        "error",
      );
      return;
    }

    if (acceptedFiles.length === 0) {
      updateStatus(
        rejected.length > 0
          ? locale === "pt"
            ? `Nenhum anexo aceito. ${rejected.join("; ")}`
            : `No attachment accepted. ${rejected.join("; ")}`
          : locale === "pt"
            ? "Nenhum anexo válido selecionado."
            : "No valid attachment selected.",
        "error",
      );
      return;
    }

    setAttachmentsImportProgress(0);
    updateStatus(
      locale === "pt"
        ? `Importando ${acceptedFiles.length} anexo(s)...`
        : `Importing ${acceptedFiles.length} attachment(s)...`,
      "loading",
    );

    try {
      const next: AttachmentPreview[] = [];

      for (let index = 0; index < acceptedFiles.length; index += 1) {
        const file = acceptedFiles[index];
        const dataUrl = await readFileAsDataUrl(file, (fileProgress) => {
          const progress =
            ((index + fileProgress / 100) / acceptedFiles.length) * 100;
          setAttachmentsImportProgress(Math.min(100, Math.round(progress)));
        });

        next.push({
          id: `${Date.now()}-${index}-${file.name}`,
          fileName: file.name,
          mimeType: inferMimeType(file),
          dataUrl,
          sizeBytes: file.size,
        });
      }

      updateActiveDocument((document) => ({
        ...document,
        attachments: [...document.attachments, ...next].slice(
          0,
          FREE_LIMITS.attachments.maxFilesPerDocument,
        ),
      }));
      setAttachmentsImportProgress(100);
      updateStatus(
        rejected.length > 0
          ? locale === "pt"
            ? `${next.length} anexo(s) carregado(s). Ignorados: ${rejected.join("; ")}`
            : `${next.length} attachment(s) loaded. Ignored: ${rejected.join("; ")}`
          : locale === "pt"
            ? `${next.length} anexo(s) carregado(s).`
            : `${next.length} attachment(s) loaded.`,
        "success",
      );
      window.setTimeout(() => setAttachmentsImportProgress(null), 700);
    } catch {
      updateStatus(
        locale === "pt"
          ? "Falha ao importar anexos."
          : "Failed to import attachments.",
        "error",
      );
      setAttachmentsImportProgress(null);
    }
  }

  async function handleCustomLogo(file: File) {
    if (!file) {
      return;
    }

    const mimeType = inferMimeType(file);
    if (
      !FREE_LIMITS.branding.allowedMimeTypes.includes(
        mimeType as (typeof FREE_LIMITS.branding.allowedMimeTypes)[number],
      )
    ) {
      updateStatus(
        locale === "pt"
          ? `Formato de logo não permitido. Tipos aceitos: ${FREE_LIMITS.branding.allowedMimeTypes.join(", ")}.`
          : `Unsupported logo type. Accepted types: ${FREE_LIMITS.branding.allowedMimeTypes.join(", ")}.`,
        "error",
      );
      return;
    }

    if (file.size > FREE_LIMITS.branding.maxLogoBytes) {
      updateStatus(
        locale === "pt"
          ? `Logo acima de ${formatBytes(FREE_LIMITS.branding.maxLogoBytes)}.`
          : `Logo exceeds ${formatBytes(FREE_LIMITS.branding.maxLogoBytes)}.`,
        "error",
      );
      return;
    }

    setLogoImportProgress(0);
    updateStatus(
      locale === "pt" ? `Importando logo: ${file.name}` : `Importing logo: ${file.name}`,
      "loading",
    );

    try {
      const dataUrl = await readFileAsDataUrl(file, setLogoImportProgress);
      setCustomLogo({
        id: `${Date.now()}-logo-${file.name}`,
        fileName: file.name,
        mimeType,
        dataUrl,
        sizeBytes: file.size,
      });
      setLogoImportProgress(100);
      updateStatus(
        locale === "pt"
          ? `Logo aplicada ao documento: ${file.name}`
          : `Logo applied to the document: ${file.name}`,
        "success",
      );
      window.setTimeout(() => setLogoImportProgress(null), 700);
    } catch {
      updateStatus(
        locale === "pt" ? "Falha ao importar logo." : "Failed to import logo.",
        "error",
      );
      setLogoImportProgress(null);
    }
  }

  async function onMarkdownFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await handleMarkdownFile(file);
    event.target.value = "";
  }

  async function onAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    await handleAttachmentFiles(files);
    event.target.value = "";
  }

  async function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await handleCustomLogo(file);
    event.target.value = "";
  }

  function removeAttachment(id: string) {
    updateActiveDocument((document) => ({
      ...document,
      attachments: document.attachments.filter((item) => item.id !== id),
    }));
  }

  function removeCustomLogo() {
    setCustomLogo(null);
  }

  function preventDragDefaults(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  async function onMarkdownDrop(event: DragEvent<HTMLElement>) {
    preventDragDefaults(event);
    setIsMdDragOver(false);

    const files = Array.from(event.dataTransfer.files ?? []);
    const candidate = files.find(
      (file) =>
        file.name.toLowerCase().endsWith(".md") || file.type.includes("text"),
    );
    if (!candidate) {
      updateStatus(
        locale === "pt"
          ? "Arraste um arquivo .md válido."
          : "Drop a valid .md file.",
        "error",
      );
      return;
    }

    await handleMarkdownFile(candidate);
  }

  async function onImageDrop(event: DragEvent<HTMLElement>) {
    preventDragDefaults(event);
    setIsImageDragOver(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    await handleAttachmentFiles(files);
  }

  async function onLogoDrop(event: DragEvent<HTMLElement>) {
    preventDragDefaults(event);
    setIsLogoDragOver(false);

    const file = Array.from(event.dataTransfer.files ?? [])[0];
    if (!file) {
      return;
    }

    await handleCustomLogo(file);
  }

  async function convertToPdf(event: FormEvent) {
    event.preventDefault();

    if (documents.some((item) => item.markdown.trim().length === 0)) {
      updateStatus(
        locale === "pt"
          ? "Todos os documentos precisam ter markdown antes da geração."
          : "Every document needs markdown content before generation.",
        "error",
      );
      return;
    }

    if (documents.some((item) => item.markdown.length > FREE_LIMITS.markdown.maxChars)) {
      updateStatus(
        locale === "pt"
          ? `Um dos documentos excede ${FREE_LIMITS.markdown.maxChars.toLocaleString("pt-BR")} caracteres.`
          : `One document exceeds ${FREE_LIMITS.markdown.maxChars.toLocaleString("en-US")} characters.`,
        "error",
      );
      return;
    }

    if (totalMarkdownChars > FREE_LIMITS.documents.maxTotalChars) {
      updateStatus(
        locale === "pt"
          ? `O pacote excede ${FREE_LIMITS.documents.maxTotalChars.toLocaleString("pt-BR")} caracteres no total.`
          : `The bundle exceeds ${FREE_LIMITS.documents.maxTotalChars.toLocaleString("en-US")} characters in total.`,
        "error",
      );
      return;
    }

    if (totalAttachmentBytes > FREE_LIMITS.attachments.maxTotalBytes) {
      updateStatus(
        locale === "pt"
          ? `Total de anexos acima de ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}.`
          : `Total attachments above ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}.`,
        "error",
      );
      return;
    }

    setLoading(true);
    setConvertProgress(2);
    setLastGeneratedFile(null);
    updateStatus(
      locale === "pt"
        ? documents.length > 1
          ? "Enviando conteúdos para geração..."
          : "Enviando conteúdo para geração..."
        : documents.length > 1
          ? "Uploading files for generation..."
          : "Uploading content for generation...",
      "loading",
    );
    trackHomeEvent("gerar_pdf", {
      markdown_chars: totalMarkdownChars,
      documents_count: documents.length,
      attachments_count: documents.reduce(
        (sum, item) => sum + item.attachments.length,
        0,
      ),
      has_custom_logo: Boolean(customLogo),
    });

    const requestPdf = async (
      documentsPayload: Array<{
        markdown: string;
        fileName: string;
        attachments: { fileName: string; mimeType: string; dataUrl: string }[];
      }>,
      progressBase = 2,
      progressCap = 100,
    ) => {
      const payload = {
        documents: documentsPayload,
        customLogo: customLogo
          ? {
              fileName: customLogo.fileName,
              mimeType: customLogo.mimeType,
              dataUrl: customLogo.dataUrl,
              tone: customLogoTone,
            }
          : undefined,
      };

      const body = JSON.stringify(payload);

      return new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/free/convert");
        xhr.responseType = "blob";
        xhr.setRequestHeader("content-type", "application/json");

        let processingTimer: number | null = null;
        let processingStarted = false;

        const clearProcessingTimer = () => {
          if (processingTimer !== null) {
            window.clearInterval(processingTimer);
            processingTimer = null;
          }
        };

        xhr.upload.onprogress = (uploadEvent) => {
          if (!uploadEvent.lengthComputable || uploadEvent.total <= 0) {
            return;
          }

          const progressSpan = Math.max(1, progressCap - progressBase - 5);
          const progress = Math.min(
            progressCap - 5,
            progressBase +
              Math.round((uploadEvent.loaded / uploadEvent.total) * progressSpan),
          );
          setConvertProgress((prev) => Math.max(prev ?? 2, progress));
          updateStatus(
            locale === "pt"
              ? `Enviando conteúdo: ${progress}%`
              : `Uploading content: ${progress}%`,
            "loading",
          );
        };

        xhr.onreadystatechange = () => {
          if (
            xhr.readyState < XMLHttpRequest.HEADERS_RECEIVED ||
            processingStarted
          ) {
            return;
          }

          processingStarted = true;
          updateStatus(
            locale === "pt"
              ? documentsPayload.length > 1
                ? "Gerando PDFs..."
                : "Gerando PDF..."
              : documentsPayload.length > 1
                ? "Generating PDFs..."
                : "Generating PDF...",
            "loading",
          );

          processingTimer = window.setInterval(() => {
            setConvertProgress((prev) => {
              const current = prev ?? progressBase;
              return current >= progressCap - 1 ? current : current + 1;
            });
          }, 220);
        };

        xhr.onerror = () => {
          clearProcessingTimer();
          reject(
            new Error(
              locale === "pt"
                ? "Falha de rede ao gerar PDF."
                : "Network error while generating PDF.",
            ),
          );
        };

        xhr.onload = async () => {
          clearProcessingTimer();

          if (xhr.status >= 200 && xhr.status < 300) {
            setConvertProgress(100);
            resolve(xhr.response);
            return;
          }

          try {
            const errorText = await xhr.response.text();
            const parsed = JSON.parse(errorText) as {
              message?: string;
              error?: string;
            };
            reject(
              new Error(parsed.message ?? parsed.error ?? "conversion_failed"),
            );
          } catch {
            reject(new Error("conversion_failed"));
          }
        };

        xhr.send(body);
      });
    };

    try {
      const documentsPayload = documents.map((document) => ({
        markdown: document.markdown,
        fileName: document.fileName,
        attachments: document.attachments.map(
          ({ fileName: name, mimeType, dataUrl }) => ({
            fileName: name,
            mimeType,
            dataUrl,
          }),
        ),
      }));

      const triggerDownload = (blob: Blob, downloadName: string) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = downloadName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
      };

      if (documents.length === 1) {
        const blob = await requestPdf(documentsPayload);
        const downloadName = `${fileName.replace(/\.md$/i, "")}.pdf`;
        triggerDownload(blob, downloadName);
        setLastGeneratedFile(downloadName);
        updateStatus(
          locale === "pt"
            ? "PDF gerado com sucesso. Download iniciado."
            : "PDF generated successfully. Download started.",
          "success",
        );
      } else {
        const downloadNames: string[] = [];
        for (const [index, document] of documentsPayload.entries()) {
          const progressBase = Math.round((index / documentsPayload.length) * 100);
          const progressCap = Math.round(((index + 1) / documentsPayload.length) * 100);
          updateStatus(
            locale === "pt"
              ? `Gerando PDF ${index + 1} de ${documentsPayload.length}...`
              : `Generating PDF ${index + 1} of ${documentsPayload.length}...`,
            "loading",
          );
          const blob = await requestPdf([document], progressBase, progressCap);
          const downloadName = `${document.fileName.replace(/\.md$/i, "")}.pdf`;
          triggerDownload(blob, downloadName);
          downloadNames.push(downloadName);
        }
        setConvertProgress(100);
        setLastGeneratedFile(downloadNames.join(", "));
        updateStatus(
          locale === "pt"
            ? "PDFs gerados com sucesso. Downloads iniciados."
            : "PDFs generated successfully. Downloads started.",
          "success",
        );
      }
      window.setTimeout(() => setConvertProgress(null), 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : locale === "pt"
            ? "Erro inesperado"
            : "Unexpected error";
      updateStatus(
        locale === "pt"
          ? `Falha na conversão: ${message}`
          : `Conversion failed: ${message}`,
        "error",
      );
      setConvertProgress(null);
    } finally {
      setLoading(false);
    }
  }

  function trackPrimaryCta(area: string) {
    trackHomeEvent("click_testar_gratis", { area });
  }

  function trackPricing(area: string) {
    trackHomeEvent("open_pricing", { area });
  }

  function trackWaitlist(area: string) {
    trackHomeEvent("entrar_lista", { area });
  }

  function trackSupport(area: string) {
    trackHomeEvent("open_support", { area });
  }

  const previewDocument = (expanded = false) => (
    <div className={`preview-document-shell ${expanded ? "expanded" : ""}`}>
      <div className={`preview-document-page ${expanded ? "expanded" : ""}`}>
        <header className="preview-document-header">
          <div className="preview-document-left">
            <div className="preview-document-client-card">
              <div
                className={`preview-brand-client-surface tone-${customLogoTone}`}
              >
                {customLogo ? (
                  <img alt={customLogo.fileName} src={customLogo.dataUrl} />
                ) : (
                  <div className="preview-brand-placeholder">+</div>
                )}
              </div>
            </div>
          </div>
          <div className="preview-document-side">
            <div className="preview-document-nexo-mark">
              <img alt="NEXO" src="/brand/nexo_logo_primary.svg" />
              <span>NEXO</span>
            </div>
          </div>
        </header>

        <section className="preview-document-content">
          {markdown.trim() ? (
            <div
              className={`preview-document-markdown-wrap ${expanded ? "expanded" : ""}`}
            >
              <div
                className="preview-document-markdown"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          ) : (
            <div className="preview-document-empty">{c.previewEmpty}</div>
          )}

          {attachments.length > 0 ? (
            <div className="preview-document-attachments">
              <strong>
                {attachments.length}{" "}
                {attachments.length === 1
                  ? locale === "pt"
                    ? "evidência anexada"
                    : "evidence attached"
                  : locale === "pt"
                    ? "evidências anexadas"
                    : "evidences attached"}
              </strong>
              <small>{c.docsAttachmentsHint}</small>
            </div>
          ) : null}
        </section>

        <footer className="preview-document-footer">
          <span className="preview-document-footer-badge">FREE</span>
          <span>{fileName} · Prévia visual do PDF</span>
        </footer>
      </div>
    </div>
  );

  return (
    <>
      <Script
        id="nexo-home-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <main className="sales-page motion-root">
        <div className="page-nav-shell motion rise-1">
          <header className="hero-nav landing-nav">
            <Link href="/" className="hero-brand hero-brand-link">
              <img alt="NEXO" src="/brand/nexo_logo_primary.svg" />
              <strong>NEXO</strong>
            </Link>

            <button
              className="nav-menu-toggle"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-nav-links"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            <div
              className={`landing-nav-panel ${mobileMenuOpen ? "is-open" : ""}`}
              id="landing-nav-links"
            >
              <nav>
                <Link
                  href="/"
                  className={isHomeActive ? "nav-link-active" : undefined}
                  aria-current={isHomeActive ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {c.navProduct}
                </Link>
                <a href="#como-funciona" onClick={closeMenu}>
                  {c.navHow}
                </a>
                <a href="#free-converter" onClick={closeMenu}>
                  {c.navFree}
                </a>
                <Link href="/cli" onClick={closeMenu}>
                  {c.navCli}
                </Link>
                <a href="#suporte" onClick={closeMenu}>
                  {c.navSupport}
                </a>
                <Link
                  href="/pricing"
                  onClick={() => {
                    closeMenu();
                    trackPricing("nav");
                  }}
                >
                  {c.navPlans}
                </Link>
              </nav>

              <div className="hero-nav-actions">
                <LocaleToggle />
                <ThemeToggle />
                <Link
                  className="btn-nav-ghost"
                  href="/pricing"
                  onClick={() => {
                    closeMenu();
                    trackWaitlist("nav");
                  }}
                >
                  {c.ctaWaitlist}
                </Link>
                <a
                  className="btn-nav-solid"
                  href="#free-converter"
                  onClick={() => {
                    closeMenu();
                    trackPrimaryCta("nav");
                  }}
                >
                  {c.ctaPrimary}
                </a>
              </div>
            </div>
          </header>
        </div>

        <section className="nexo-hero-wrap section-transition motion rise-1">
          <div className="hero-grid landing-hero-grid" data-deck-group>
            <div className="deck-card hero-copy-card">
              <p className="hero-badge">{c.heroBadge}</p>
              <h1>{c.heroTitle}</h1>
              <p className="hero-copy">{c.heroCopy}</p>

              <div className="hero-cta-row">
                <a
                  className="btn-cta-main"
                  href="#free-converter"
                  onClick={() => trackPrimaryCta("hero")}
                >
                  {c.ctaPrimary}
                </a>
                <a className="btn-cta-alt" href="#como-funciona">
                  {c.ctaSecondary}
                </a>
              </div>

              <div className="hero-proof-list">
                <span>{c.heroValue1}</span>
                <span>{c.heroValue2}</span>
                <span>{c.heroValue3}</span>
              </div>
            </div>

            <aside className="hero-visual deck-card">
              <div className="hero-visual-head">
                <small>{c.heroFlowLabel}</small>
                <strong>{c.heroFlowTitle}</strong>
                <p>{c.heroFlowCopy}</p>
              </div>

              <div className="hero-flow-canvas" aria-hidden="true">
                <div className="hero-flow-card">
                  <span>{c.heroMockInput}</span>
                  <strong>.md</strong>
                  <ul>
                    <li>{c.heroMockStep1}</li>
                    <li>{c.heroMockStep2}</li>
                    <li>{c.heroMockStep3}</li>
                  </ul>
                </div>
                <div className="hero-flow-arrow">
                  <span />
                </div>
                <div className="hero-flow-card hero-flow-card-output">
                  <span>{c.heroMockOutput}</span>
                  <strong>PDF</strong>
                  <div className="hero-doc-preview">
                    <em>{c.trustLabel}</em>
                    <b>{c.trustValue}</b>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="section-white-grid section-transition motion rise-2">
          <div className="shell-lite">
            <p className="section-kicker">{c.problemKicker}</p>
            <h2>{c.problemTitle}</h2>
            <p>{c.problemCopy}</p>
            <div className="white-cards" data-deck-group>
              <article className="deck-card">
                <strong>{c.problem1t}</strong>
                <span>{c.problem1d}</span>
              </article>
              <article className="deck-card">
                <strong>{c.problem2t}</strong>
                <span>{c.problem2d}</span>
              </article>
              <article className="deck-card">
                <strong>{c.problem3t}</strong>
                <span>{c.problem3d}</span>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section-dark-feature section-transition motion rise-2"
          id="como-funciona"
        >
          <div className="shell-dark surface-lift">
            <p className="section-kicker section-kicker-dark">{c.solutionKicker}</p>
            <h2 className="section-title-dark">{c.solutionTitle}</h2>
            <p className="section-copy-dark">{c.solutionCopy}</p>

            <div className="feature-panel landing-steps" data-deck-group>
              <aside className="deck-card landing-steps-summary">
                <p>{c.stepsTitle}</p>
                <ul>
                  <li>{c.step1d}</li>
                  <li>{c.step2d}</li>
                  <li>{c.step3d}</li>
                </ul>
              </aside>
              <div className="landing-step-grid">
                <article className="deck-card landing-step-card">
                  <strong>{c.step1t}</strong>
                  <p>{c.step1d}</p>
                </article>
                <article className="deck-card landing-step-card">
                  <strong>{c.step2t}</strong>
                  <p>{c.step2d}</p>
                </article>
                <article className="deck-card landing-step-card">
                  <strong>{c.step3t}</strong>
                  <p>{c.step3d}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="section-transition motion rise-2">
          <div className="landing-section-shell">
            <div className="landing-section-head">
              <p className="section-kicker">{c.productKicker}</p>
              <h2>{c.productTitle}</h2>
              <p>{c.productCopy}</p>
            </div>

            <div className="feature-columns landing-product-grid" data-deck-group>
              <article className="deck-card landing-product-card">
                <strong>{c.productStat1}</strong>
                <p>{c.benefit2d}</p>
              </article>
              <article className="deck-card landing-product-card">
                <strong>{c.productStat2}</strong>
                <p>{c.heroFlowCopy}</p>
              </article>
              <article className="deck-card landing-product-card">
                <strong>{c.productStat3}</strong>
                <p>{c.benefit3d}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-transition motion rise-2">
          <div className="landing-section-shell landing-benefits-shell">
            <div className="landing-section-head">
              <p className="section-kicker">{c.benefitsKicker}</p>
              <h2>{c.benefitsTitle}</h2>
            </div>

            <div className="landing-benefits-grid" data-deck-group>
              <article className="deck-card landing-benefit-card">
                <strong>{c.benefit1t}</strong>
                <p>{c.benefit1d}</p>
              </article>
              <article className="deck-card landing-benefit-card">
                <strong>{c.benefit2t}</strong>
                <p>{c.benefit2d}</p>
              </article>
              <article className="deck-card landing-benefit-card">
                <strong>{c.benefit3t}</strong>
                <p>{c.benefit3d}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-transition motion rise-2">
          <div className="landing-section-shell landing-examples-shell">
            <div className="landing-section-head">
              <p className="section-kicker">{c.examplesKicker}</p>
              <h2>{c.examplesTitle}</h2>
              <p>{c.examplesCopy}</p>
            </div>

            <div className="landing-examples-grid" data-deck-group>
              {EXAMPLE_DOCUMENTS.map((example) => (
                <article key={example.slug} className="deck-card landing-example-card">
                  <div className="landing-example-head">
                    <strong>{example.title[locale]}</strong>
                    <small>{example.fileName}</small>
                  </div>
                  <p>{example.summary[locale]}</p>
                  <div className="landing-example-actions">
                    <button
                      type="button"
                      className="landing-example-action"
                      onClick={() => loadExample(example.slug)}
                    >
                      {c.examplesUse}
                    </button>
                    <a
                      className="landing-example-link"
                      href={`/examples/${example.slug}.pdf`}
                      download
                    >
                      {c.examplesDownloadPdf}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="converter-wrap section-transition motion rise-3"
          id="free-converter"
        >
          <div className="converter-head">
            <p>{c.freeKicker}</p>
            <h2>{c.freeTitle}</h2>
            <span>{c.freeSubtitle}</span>

            <div className="free-security-note">
              <strong>{c.freeSecurityTitle}</strong>
              <ul>
                <li>{c.freeSecurity1}</li>
                <li>{c.freeSecurity2}</li>
                <li>{c.freeSecurity3}</li>
                <li>{c.freeSecurity4}</li>
              </ul>
            </div>
          </div>

          <div className="converter-grid" data-deck-group>
            <form className="converter-panel deck-card" onSubmit={convertToPdf}>
              <div className="converter-meta-grid">
                <div className="converter-meta-card">
                  <small>{c.docsLabel}</small>
                  <strong>
                    {documents.length}/{FREE_LIMITS.documents.maxFiles}
                  </strong>
                </div>
                <div className="converter-meta-card">
                  <small>{c.docsActive}</small>
                  <strong>{fileName}</strong>
                </div>
                <div className="converter-meta-card">
                  <small>{c.imgLabel}</small>
                  <strong>
                    {attachments.length}/
                    {FREE_LIMITS.attachments.maxFilesPerDocument}
                  </strong>
                </div>
                <div className="converter-meta-card">
                  <small>{c.logoLabel}</small>
                  <strong>{customLogo ? c.logoSelected : "-"}</strong>
                </div>
              </div>

              <div className="document-switcher">
                <div className="document-switcher-head">
                  <div>
                    <strong>{c.docsLabel}</strong>
                    <small>{c.docsHelper}</small>
                  </div>
                  <button type="button" onClick={addDocument}>
                    {c.docsAdd}
                  </button>
                </div>
                <div className="document-switcher-list">
                  {documents.map((document, index) => {
                    const isActive = document.id === activeDocument?.id;
                    const shortName =
                      document.fileName.trim() || `${c.docUntitled} ${index + 1}`;
                    return (
                      <button
                        key={document.id}
                        type="button"
                        className={`document-pill ${isActive ? "active" : ""}`}
                        onClick={() => setActiveDocumentId(document.id)}
                      >
                        <span>MD {index + 1}</span>
                        <strong>{shortName}</strong>
                        <small>
                          {document.attachments.length}/
                          {FREE_LIMITS.attachments.maxFilesPerDocument} imgs
                        </small>
                      </button>
                    );
                  })}
                </div>
                {documents.length > 1 ? (
                  <div className="document-switcher-actions">
                    <button
                      type="button"
                      className="document-remove"
                      onClick={() => activeDocument && removeDocument(activeDocument.id)}
                    >
                      {c.docsRemove}
                    </button>
                  </div>
                ) : null}
              </div>

              <label htmlFor="md-file">{c.mdLabel}</label>
              <input
                className="sr-only"
                id="md-file"
                ref={markdownInputRef}
                type="file"
                accept=".md,text/markdown,text/plain"
                onChange={onMarkdownFileChange}
              />
              <div
                className={`upload-card ${isMdDragOver ? "drag-over" : ""}`}
                onClick={() => markdownInputRef.current?.click()}
                onDragEnter={(event) => {
                  preventDragDefaults(event);
                  setIsMdDragOver(true);
                }}
                onDragOver={(event) => {
                  preventDragDefaults(event);
                  setIsMdDragOver(true);
                }}
                onDragLeave={(event) => {
                  preventDragDefaults(event);
                  setIsMdDragOver(false);
                }}
                onDrop={onMarkdownDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    markdownInputRef.current?.click();
                  }
                }}
              >
                <p className="upload-title">
                  {isMdDragOver ? c.mdDragging : c.mdDrop}
                </p>
                <p className="upload-subtitle">
                  {c.mdCurrent}: {markdown.trim() ? fileName : c.noMdYet}
                </p>
              </div>

              {mdImportProgress !== null ? (
                <div className="progress-block" aria-live="polite">
                  <div className="progress-head">
                    <small>{c.mdImporting}</small>
                    <small>{mdImportProgress}%</small>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={mdImportProgress}
                  >
                    <span style={{ width: `${mdImportProgress}%` }} />
                  </div>
                </div>
              ) : null}

              <label htmlFor="image-files">{c.imgLabel}</label>
              <input
                className="sr-only"
                id="image-files"
                ref={imageInputRef}
                type="file"
                accept=".png,image/png,.jpg,.jpeg,image/jpeg,.webp,image/webp"
                multiple
                onChange={onAttachmentChange}
              />
              <div
                className={`upload-card upload-card-images ${isImageDragOver ? "drag-over" : ""}`}
                onClick={() => imageInputRef.current?.click()}
                onDragEnter={(event) => {
                  preventDragDefaults(event);
                  setIsImageDragOver(true);
                }}
                onDragOver={(event) => {
                  preventDragDefaults(event);
                  setIsImageDragOver(true);
                }}
                onDragLeave={(event) => {
                  preventDragDefaults(event);
                  setIsImageDragOver(false);
                }}
                onDrop={onImageDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    imageInputRef.current?.click();
                  }
                }}
              >
                <p className="upload-title">
                  {isImageDragOver ? c.imgDragging : c.imgDrop}
                </p>
                <p className="upload-subtitle">
                  {attachments.length} /{" "}
                  {FREE_LIMITS.attachments.maxFilesPerDocument}{" "}
                  {c.attachmentsSelected}
                </p>
              </div>

              {attachmentsImportProgress !== null ? (
                <div className="progress-block" aria-live="polite">
                  <div className="progress-head">
                    <small>{c.imgImporting}</small>
                    <small>{attachmentsImportProgress}%</small>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={attachmentsImportProgress}
                  >
                    <span style={{ width: `${attachmentsImportProgress}%` }} />
                  </div>
                </div>
              ) : null}

              <label htmlFor="logo-file">{c.logoLabel}</label>
              <input
                className="sr-only"
                id="logo-file"
                ref={logoInputRef}
                type="file"
                accept=".png,image/png,.jpg,.jpeg,image/jpeg,.webp,image/webp"
                onChange={onLogoChange}
              />
              <div
                className={`upload-card upload-card-logo ${isLogoDragOver ? "drag-over" : ""}`}
                onClick={() => logoInputRef.current?.click()}
                onDragEnter={(event) => {
                  preventDragDefaults(event);
                  setIsLogoDragOver(true);
                }}
                onDragOver={(event) => {
                  preventDragDefaults(event);
                  setIsLogoDragOver(true);
                }}
                onDragLeave={(event) => {
                  preventDragDefaults(event);
                  setIsLogoDragOver(false);
                }}
                onDrop={onLogoDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    logoInputRef.current?.click();
                  }
                }}
              >
                <p className="upload-title">
                  {isLogoDragOver ? c.logoDragging : c.logoDrop}
                </p>
                <p className="upload-subtitle">{c.logoHint}</p>
              </div>

              {logoImportProgress !== null ? (
                <div className="progress-block" aria-live="polite">
                  <div className="progress-head">
                    <small>{c.logoLabel}</small>
                    <small>{logoImportProgress}%</small>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={logoImportProgress}
                  >
                    <span style={{ width: `${logoImportProgress}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="logo-tone-group" aria-label={c.logoToneLabel}>
                <button
                  type="button"
                  className={`logo-tone-button tone-dark ${customLogoTone === "dark" ? "active" : ""}`}
                  onClick={() => setCustomLogoTone("dark")}
                >
                  <strong>{c.logoToneDark}</strong>
                  <small>{c.logoToneDarkHint}</small>
                </button>
                <button
                  type="button"
                  className={`logo-tone-button tone-light ${customLogoTone === "light" ? "active" : ""}`}
                  onClick={() => setCustomLogoTone("light")}
                >
                  <strong>{c.logoToneLight}</strong>
                  <small>{c.logoToneLightHint}</small>
                </button>
              </div>

              {customLogo ? (
                <div className="logo-preview-card">
                  <div className={`logo-preview-surface tone-${customLogoTone}`}>
                    <img
                      alt={customLogo.fileName}
                      src={customLogo.dataUrl}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <strong>{customLogo.fileName}</strong>
                    <small>
                      {customLogo.mimeType} · {formatBytes(customLogo.sizeBytes ?? 0)}
                    </small>
                  </div>
                  <button type="button" onClick={removeCustomLogo}>
                    {c.removeLogo}
                  </button>
                </div>
              ) : null}

              <div className="attachments-list">
                <small className="attachments-context">{c.docsAttachmentsHint}</small>
                {attachments.length === 0 ? (
                  <small>{c.noAttachment}</small>
                ) : (
                  attachments.map((item) => (
                    <div className="attachment-item" key={item.id}>
                      <img
                        alt={item.fileName}
                        src={item.dataUrl}
                        loading="lazy"
                        decoding="async"
                      />
                      <div>
                        <strong>{item.fileName}</strong>
                        <small>
                          {item.mimeType} ·{" "}
                          {formatBytes(getAttachmentSizeBytes(item))}
                        </small>
                      </div>
                      <button
                        onClick={() => removeAttachment(item.id)}
                        type="button"
                      >
                        {c.remove}
                      </button>
                    </div>
                  ))
                )}
              </div>

              <label htmlFor="markdown">{c.contentMd}</label>
              <div className="markdown-counter" aria-live="polite">
                <span className={markdownNearLimit ? "counter-warn" : undefined}>
                  {markdownLength.toLocaleString(formatLocale)} /{" "}
                  {FREE_LIMITS.markdown.maxChars.toLocaleString(formatLocale)}{" "}
                  {locale === "pt" ? "caracteres" : "characters"}
                </span>
                <span>
                  {c.docsTotalChars}:{" "}
                  {totalMarkdownChars.toLocaleString(formatLocale)} /{" "}
                  {FREE_LIMITS.documents.maxTotalChars.toLocaleString(
                    formatLocale,
                  )}
                </span>
              </div>
              <textarea
                id="markdown"
                rows={14}
                maxLength={FREE_LIMITS.markdown.maxChars}
                value={markdown}
                onChange={(event) =>
                  updateActiveDocument((document) => ({
                    ...document,
                    markdown: event.target.value,
                  }))
                }
              />
              <small className="limit-hint">
                {c.limits}: {FREE_LIMITS.markdown.maxChars.toLocaleString(formatLocale)}{" "}
                {locale === "pt" ? "caracteres," : "characters,"}{" "}
                {FREE_LIMITS.attachments.maxFilesPerDocument}{" "}
                {locale === "pt" ? "anexos por documento, até" : "attachments per document, up to"}{" "}
                {formatBytes(FREE_LIMITS.attachments.maxFileBytes)}{" "}
                {locale === "pt" ? "por anexo e" : "per file and"}{" "}
                {formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}{" "}
                {locale === "pt" ? "no total. Até" : "total. Up to"}{" "}
                {FREE_LIMITS.documents.maxFiles}{" "}
                {locale === "pt" ? "markdowns por geração." : "markdown files per run."}
              </small>

              <div className={`status-card status-${statusKind}`} aria-live="polite">
                <strong>{statusMessage}</strong>
                <small>
                  {locale === "pt"
                    ? "Nenhum conteúdo é salvo no modo Free."
                    : "No content is stored in Free mode."}
                </small>
              </div>

              <div className="submit-row">
                <button
                  disabled={loading || documents.some((item) => !item.markdown.trim())}
                  type="submit"
                >
                  {loading
                    ? documents.length > 1
                      ? c.convertingMany
                      : c.converting
                    : documents.length > 1
                      ? c.generateMany
                      : c.generate}
                </button>
              </div>

              {convertProgress !== null ? (
                <div
                  className="progress-block progress-block-submit"
                  aria-live="polite"
                >
                  <div className="progress-head">
                    <small>{c.genProgress}</small>
                    <small>{convertProgress}%</small>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={convertProgress}
                  >
                    <span style={{ width: `${convertProgress}%` }} />
                  </div>
                </div>
              ) : null}

              {lastGeneratedFile ? (
                <div className="generated-card">
                  <strong>
                    {documents.length > 1 ? c.generatedManyTitle : c.generatedTitle}
                  </strong>
                  <p>
                    {documents.length > 1 ? c.generatedManyCopy : c.generatedCopy}
                  </p>
                  <small>{lastGeneratedFile}</small>
                </div>
              ) : null}
            </form>

            <article className="converter-panel preview-panel deck-card">
              <div className="output-head">
                <h3>{c.previewTitle}</h3>
                <small>{markdown.trim() ? fileName : c.noMdYet}</small>
              </div>
              <small className="preview-context">{c.docsPreviewHint}</small>
              <button
                type="button"
                className="preview-mobile-open"
                onClick={() => setPreviewModalOpen(true)}
              >
                {c.previewOpen}
              </button>
              <button
                type="button"
                className="preview-desktop-open"
                onClick={() => setPreviewExpanded(true)}
              >
                {c.previewExpand}
              </button>
              <div className="preview-inline-shell">{previewDocument()}</div>
            </article>
          </div>
        </section>

        <section className="section-transition motion rise-2">
          <div className="landing-section-shell landing-access-shell" id="planos">
            <div className="landing-section-head">
              <p className="section-kicker">{c.plansKicker}</p>
              <h2>{c.plansTitle}</h2>
              <p>{c.plansCopy}</p>
            </div>

            <div className="landing-access-grid" data-deck-group>
              <article className="deck-card landing-access-card">
                <strong>{c.pricingCardTitle}</strong>
                <p>{c.pricingCardBody}</p>
                <Link
                  className="btn-cta-alt"
                  href="/pricing"
                  onClick={() => trackPricing("plans_card")}
                >
                  {c.ctaPlans}
                </Link>
              </article>
              <article className="deck-card landing-access-card landing-access-card-highlight">
                <strong>{c.waitlistCardTitle}</strong>
                <p>{c.waitlistCardBody}</p>
                <Link
                  className="btn-cta-main"
                  href="/pricing"
                  onClick={() => trackWaitlist("plans_waitlist")}
                >
                  {c.ctaWaitlist}
                </Link>
              </article>
            </div>

            <div className="landing-note">
              <p>{c.plansNote}</p>
            </div>
          </div>
        </section>

        <section
          className="section-transition motion rise-2"
          id="suporte"
        >
          <div className="landing-section-shell landing-support-shell">
            <div className="landing-section-head">
              <p className="section-kicker">{c.supportKicker}</p>
              <h2>{c.supportTitle}</h2>
              <p>{c.supportCopy}</p>
            </div>

            <div className="landing-support-grid" data-deck-group>
              <article className="deck-card landing-support-card">
                <ul>
                  <li>{c.supportPoint1}</li>
                  <li>{c.supportPoint2}</li>
                  <li>{c.supportPoint3}</li>
                </ul>
              </article>
              <article className="deck-card landing-support-card">
                <Link
                  className="btn-cta-alt"
                  href="/suporte"
                  onClick={() => trackSupport("support_section")}
                >
                  {c.supportCta}
                </Link>
              </article>
            </div>
          </div>
        </section>

      </main>

      {previewModalOpen ? (
        <div
          className="preview-mobile-modal"
          role="dialog"
          aria-modal="true"
          aria-label={c.previewTitle}
        >
          <div
            className="preview-mobile-backdrop"
            onClick={() => setPreviewModalOpen(false)}
          />
          <div className="preview-mobile-sheet">
            <div className="preview-mobile-head">
              <div>
                <strong>{c.previewTitle}</strong>
                <small>{markdown.trim() ? fileName : c.noMdYet}</small>
              </div>
              <button
                type="button"
                className="preview-mobile-close"
                onClick={() => setPreviewModalOpen(false)}
              >
                {c.previewClose}
              </button>
            </div>
            <div className="preview-mobile-body">{previewDocument()}</div>
          </div>
        </div>
      ) : null}

      {previewExpanded ? (
        <div
          className="preview-desktop-modal"
          role="dialog"
          aria-modal="true"
          aria-label={c.previewTitle}
        >
          <div
            className="preview-desktop-backdrop"
            onClick={() => setPreviewExpanded(false)}
          />
          <div className="preview-desktop-shell">
            <div className="preview-desktop-head">
              <div>
                <strong>{c.previewTitle}</strong>
                <small>{markdown.trim() ? fileName : c.noMdYet}</small>
              </div>
              <button
                type="button"
                className="preview-desktop-close"
                onClick={() => setPreviewExpanded(false)}
              >
                {c.previewClose}
              </button>
            </div>
            <div className="preview-desktop-body">{previewDocument(true)}</div>
          </div>
        </div>
      ) : null}

      <div className="page-footer-wrap">
        <SiteFooter
          onFreeClick={() => trackPrimaryCta("footer_free")}
          onPricingClick={() => trackPricing("footer")}
          onSupportClick={() => trackSupport("footer")}
        />
      </div>
    </>
  );
}
