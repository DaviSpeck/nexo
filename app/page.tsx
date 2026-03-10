"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { FREE_LIMITS, formatBytes } from "@/lib/config/free-limits";
import ThemeToggle from "@/components/theme-toggle";
import LocaleToggle from "@/components/locale-toggle";
import { useLocale } from "@/components/locale";
import { useScrollDeck } from "@/components/use-scroll-deck";
import { trackEvent } from "@/components/public-events";
import SiteFooter from "@/components/site-footer";

type AttachmentPayload = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
};

type AttachmentPreview = AttachmentPayload & {
  id: string;
  sizeBytes?: number;
};

const copy = {
  pt: {
    navProduct: "Home",
    navFree: "Free",
    navPlans: "Planos",
    ctaAccess: "Fazer acesso",
    ctaCreate: "Criar conta",
    heroBadge: "NEXO PARA OPERAÇÕES CRÍTICAS",
    heroTitle:
      "Decisões de confiabilidade com linguagem executiva e execução clara.",
    heroCopy:
      "Hoje muitos documentos já nascem em Markdown via IA, o que acelera muito. A NEXO ajuda a transformar esse conteúdo técnico em PDF padronizado, claro e pronto para circulação institucional.",
    ctaTry: "Testar grátis",
    pointsTitle: "Valor direto para o sistema",
    points1: "Padroniza decisões operacionais e evita alinhamento informal.",
    points2: "Formaliza risco, rollback, responsáveis e impacto financeiro.",
    points3: "Publica PDF executivo com anexos para circulação imediata.",
    showcase1: "Comunicado estruturado com objetivo, contexto e diretrizes.",
    showcase2: "Checklist de mudança com risco, monitoramento e rollback.",
    showcase3:
      "Anexos visuais e histórico de decisão prontos para compartilhar.",
    showcaseStatus: "Status da operação",
    sectionKicker: "Problema que a NEXO resolve",
    sectionTitle:
      "Quando a decisão fica espalhada, a operação reage tarde e o impacto cresce.",
    sectionCopy:
      "Markdown é ótimo para produzir rápido, mas o PDF ainda é o formato mais reconhecido no dia a dia institucional. A NEXO conecta velocidade de criação com padrão de comunicação.",
    card1t: "Decisão fragmentada",
    card1d:
      "Discussões em múltiplos canais geram ambiguidade sobre o que foi aprovado.",
    card2t: "Execução sem contexto",
    card2d:
      "Times técnicos executam mudanças sem o racional completo de negócio e risco.",
    card3t: "Resposta lenta a eventos críticos",
    card3d:
      "Sem runbook claro, o tempo de resposta cresce e o impacto financeiro aumenta.",
    featureTabs: [
      "Confiabilidade",
      "Operação",
      "Rastreabilidade",
      "Governança",
    ],
    featureTitle: "Frentes de valor",
    featureItem1: "Monitoramento por evento crítico",
    featureItem2: "Plano de rollback explícito",
    featureItem3: "Responsável por frente e decisão",
    featureItem4: "Runbook para resposta operacional",
    feat1t: "Documentação reutilizável",
    feat1d:
      "Use modelos de comunicado sem perder consistência, padrão e histórico de evolução.",
    feat2t: "Visibilidade para negócio e tech",
    feat2d:
      "Mesmo documento atende decisão executiva e execução operacional sem retrabalho.",
    feat3t: "Governança com evidência",
    feat3d:
      "Anexos e contexto técnico ficam consolidados para auditoria, revisão e aprendizado contínuo.",
    freeKicker: "FREE CONVERTER",
    freeTitle: "Teste agora sem login e valide o fluxo em minutos",
    freeSubtitle:
      "Suba markdown (inclusive gerado por IA), anexe evidências visuais e gere um PDF consistente para compartilhar.",
    freeSecurityTitle: "Privacidade no modo Free",
    freeSecurity1: "Nenhum conteúdo do markdown é salvo no banco.",
    freeSecurity2: "Nenhuma imagem enviada é armazenada após a execução.",
    freeSecurity3: "O PDF gerado não é persistido em servidor.",
    freeSecurity4:
      "Só registramos metadados técnicos de uso para segurança e evolução do produto.",
    mdLabel: "Arquivo markdown (.md)",
    mdDrop: "Clique para selecionar ou arraste um `.md` aqui",
    mdCurrent: "Arquivo atual:",
    mdImporting: "Importando markdown",
    imgLabel: "Fotos para anexos (opcional)",
    imgDrop: "Adicione fotos com drag-and-drop",
    attachmentsSelected: "anexos selecionados",
    imgImporting: "Importando anexos",
    noAttachment: "Nenhuma foto anexada.",
    remove: "Remover",
    contentMd: "Conteúdo markdown",
    limits: "Limites:",
    generate: "Gerar PDF",
    converting: "Convertendo...",
    genProgress: "Progresso da geração",
    bottomCta:
      "Para governança completa, histórico, colaboração e templates do time, siga para os planos.",
    statusReady: "Pronto para converter.",
  },
  en: {
    navProduct: "Home",
    navFree: "Free",
    navPlans: "Plans",
    ctaAccess: "Get access",
    ctaCreate: "Create account",
    heroBadge: "NEXO FOR CRITICAL OPERATIONS",
    heroTitle:
      "Reliability decisions with executive language and clear execution.",
    heroCopy:
      "Today many documents are generated in Markdown by AI, which is great for speed. NEXO turns that technical output into standardized, readable PDFs ready for institutional circulation.",
    ctaTry: "Try for free",
    pointsTitle: "Direct system value",
    points1:
      "Standardizes operational decisions and avoids informal alignment.",
    points2: "Formalizes risk, rollback, owners, and financial impact.",
    points3: "Publishes executive PDFs with attachments for immediate sharing.",
    showcase1:
      "Structured communication with objective, context, and directives.",
    showcase2: "Change checklist with risk, monitoring, and rollback.",
    showcase3: "Visual evidence and decision history ready to share.",
    showcaseStatus: "Operation status",
    sectionKicker: "Problem NEXO solves",
    sectionTitle:
      "When decisions are scattered, operations react late and revenue pays the bill.",
    sectionCopy:
      "Markdown is excellent for fast drafting, but PDF remains the most widely accepted format across organizations. NEXO bridges creation speed with communication standardization.",
    card1t: "Fragmented decisions",
    card1d:
      "Multi-channel discussions create ambiguity about what was approved.",
    card2t: "Execution without context",
    card2d:
      "Technical teams execute changes without full business and risk rationale.",
    card3t: "Slow response to critical events",
    card3d:
      "Without a clear runbook, response time rises and financial impact grows.",
    featureTabs: ["Reliability", "Operations", "Traceability", "Governance"],
    featureTitle: "Value fronts",
    featureItem1: "Critical-event monitoring",
    featureItem2: "Explicit rollback plan",
    featureItem3: "Defined owners per decision",
    featureItem4: "Incident response runbook",
    feat1t: "Reusable documentation",
    feat1d:
      "Use communication templates while preserving consistency and decision history.",
    feat2t: "Business and tech visibility",
    feat2d:
      "One document serves executive decisions and operational execution without rework.",
    feat3t: "Evidence-driven governance",
    feat3d:
      "Attachments and technical context stay consolidated for audit and continuous learning.",
    freeKicker: "FREE CONVERTER",
    freeTitle: "Try without login and validate the flow in minutes",
    freeSubtitle:
      "Upload markdown (including AI-generated drafts), attach evidence, and generate a consistent PDF to share.",
    freeSecurityTitle: "Privacy in Free mode",
    freeSecurity1: "No markdown content is saved in the database.",
    freeSecurity2: "No uploaded images are stored after execution.",
    freeSecurity3: "The generated PDF is not persisted on the server.",
    freeSecurity4:
      "We only record technical usage metadata for security and product improvement.",
    mdLabel: "Markdown file (.md)",
    mdDrop: "Click to select or drop a `.md` file here",
    mdCurrent: "Current file:",
    mdImporting: "Importing markdown",
    imgLabel: "Images for attachments (optional)",
    imgDrop: "Add images via drag and drop",
    attachmentsSelected: "attachments selected",
    imgImporting: "Importing attachments",
    noAttachment: "No image attached.",
    remove: "Remove",
    contentMd: "Markdown content",
    limits: "Limits:",
    generate: "Generate PDF",
    converting: "Converting...",
    genProgress: "Generation progress",
    bottomCta:
      "For full governance, history, collaboration, and team templates, continue to plans.",
    statusReady: "Ready to convert.",
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

export default function HomePage() {
  useScrollDeck();
  const pathname = usePathname();
  const { locale } = useLocale();
  const c = copy[locale];
  const formatLocale = locale === "pt" ? "pt-BR" : "en-US";
  const [markdown, setMarkdown] = useState(
    "# Release Notes\n\n- Ajuste no fluxo principal\n- Correção na API\n- Atualização de textos da tela inicial",
  );
  const [fileName, setFileName] = useState("release-notes.md");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>(c.statusReady);
  const [mdImportProgress, setMdImportProgress] = useState<number | null>(null);
  const [attachmentsImportProgress, setAttachmentsImportProgress] = useState<
    number | null
  >(null);
  const [convertProgress, setConvertProgress] = useState<number | null>(null);
  const [isMdDragOver, setIsMdDragOver] = useState(false);
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const isHomeActive = pathname === "/";

  const markdownInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const markdownLength = markdown.length;
  const markdownNearLimit =
    markdownLength > Math.floor(FREE_LIMITS.markdown.maxChars * 0.9);

  useEffect(() => {
    void trackEvent({
      eventName: "page_view",
      eventSource: "web_ui",
      path: "/",
      payload: { page: "home" },
    });
  }, []);

  useEffect(() => {
    if (!status) {
      setStatus(c.statusReady);
    }
  }, [c.statusReady, status]);

  async function handleMarkdownFile(file: File) {
    if (!file) {
      return;
    }

    setMdImportProgress(0);
    setStatus(`${c.mdImporting}: ${file.name}`);

    try {
      const text = await readFileAsText(file, setMdImportProgress);
      if (text.length > FREE_LIMITS.markdown.maxChars) {
        setStatus(
          locale === "pt"
            ? `Markdown excede o limite de ${FREE_LIMITS.markdown.maxChars.toLocaleString("pt-BR")} caracteres.`
            : `Markdown exceeds the limit of ${FREE_LIMITS.markdown.maxChars.toLocaleString("en-US")} characters.`,
        );
        setMdImportProgress(null);
        return;
      }

      setMarkdown(text);
      setFileName(file.name);
      setMdImportProgress(100);
      setStatus(
        locale === "pt"
          ? `Arquivo markdown carregado: ${file.name}`
          : `Markdown file loaded: ${file.name}`,
      );
      window.setTimeout(() => setMdImportProgress(null), 700);
    } catch {
      setStatus(
        locale === "pt"
          ? "Falha ao importar o arquivo markdown."
          : "Failed to import markdown file.",
      );
      setMdImportProgress(null);
    }
  }

  async function handleAttachmentFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const remainingSlots =
      FREE_LIMITS.attachments.maxFiles - attachments.length;
    if (remainingSlots <= 0) {
      setStatus(
        locale === "pt"
          ? `Limite de ${FREE_LIMITS.attachments.maxFiles} anexos atingido.`
          : `Limit of ${FREE_LIMITS.attachments.maxFiles} attachments reached.`,
      );
      return;
    }

    const selected = files.slice(0, remainingSlots);
    const rejected: string[] = [];
    const acceptedFiles = selected.filter((file) => {
      const mimeType = file.type.toLowerCase();
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

    const currentTotalBytes = attachments.reduce(
      (sum, item) => sum + getAttachmentSizeBytes(item),
      0,
    );
    const nextTotalBytes = acceptedFiles.reduce(
      (sum, file) => sum + file.size,
      currentTotalBytes,
    );
    if (nextTotalBytes > FREE_LIMITS.attachments.maxTotalBytes) {
      setStatus(
        locale === "pt"
          ? `Total de anexos excede ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}. Remova arquivos e tente novamente.`
          : `Total attachments exceed ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}. Remove files and try again.`,
      );
      return;
    }

    if (acceptedFiles.length === 0) {
      setStatus(
        rejected.length > 0
          ? locale === "pt"
            ? `Nenhum anexo aceito. ${rejected.join("; ")}`
            : `No attachment accepted. ${rejected.join("; ")}`
          : locale === "pt"
            ? "Nenhum anexo válido selecionado."
            : "No valid attachment selected.",
      );
      return;
    }

    setAttachmentsImportProgress(0);
    setStatus(
      locale === "pt"
        ? `Importando ${acceptedFiles.length} anexo(s)...`
        : `Importing ${acceptedFiles.length} attachment(s)...`,
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
          mimeType: file.type || "application/octet-stream",
          dataUrl,
          sizeBytes: file.size,
        });
      }

      setAttachments((prev) =>
        [...prev, ...next].slice(0, FREE_LIMITS.attachments.maxFiles),
      );
      setAttachmentsImportProgress(100);

      if (rejected.length > 0) {
        setStatus(
          locale === "pt"
            ? `${next.length} anexo(s) carregado(s). Ignorados: ${rejected.join("; ")}`
            : `${next.length} attachment(s) loaded. Ignored: ${rejected.join("; ")}`,
        );
      } else {
        setStatus(
          locale === "pt"
            ? `${next.length} anexo(s) carregado(s).`
            : `${next.length} attachment(s) loaded.`,
        );
      }

      window.setTimeout(() => setAttachmentsImportProgress(null), 700);
    } catch {
      setStatus(
        locale === "pt"
          ? "Falha ao importar anexos."
          : "Failed to import attachments.",
      );
      setAttachmentsImportProgress(null);
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

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
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
      setStatus(
        locale === "pt"
          ? "Arraste um arquivo .md válido."
          : "Drop a valid .md file.",
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

  async function convertToPdf(event: FormEvent) {
    event.preventDefault();

    if (markdown.trim().length === 0) {
      setStatus(
        locale === "pt"
          ? "Informe conteúdo markdown para gerar o PDF."
          : "Provide markdown content to generate the PDF.",
      );
      return;
    }

    if (markdown.length > FREE_LIMITS.markdown.maxChars) {
      setStatus(
        locale === "pt"
          ? `Markdown acima do limite de ${FREE_LIMITS.markdown.maxChars.toLocaleString("pt-BR")} caracteres.`
          : `Markdown is above the limit of ${FREE_LIMITS.markdown.maxChars.toLocaleString("en-US")} characters.`,
      );
      return;
    }

    const totalAttachmentBytes = attachments.reduce(
      (sum, item) => sum + getAttachmentSizeBytes(item),
      0,
    );
    if (totalAttachmentBytes > FREE_LIMITS.attachments.maxTotalBytes) {
      setStatus(
        locale === "pt"
          ? `Total de anexos acima de ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}.`
          : `Total attachments above ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}.`,
      );
      return;
    }

    setLoading(true);
    setConvertProgress(2);
    setStatus(
      locale === "pt"
        ? "Enviando conteúdo para geração..."
        : "Uploading content for generation...",
    );

    try {
      const payload = {
        markdown,
        fileName,
        attachments: attachments.map<AttachmentPayload>(
          ({ fileName: name, mimeType, dataUrl }) => ({
            fileName: name,
            mimeType,
            dataUrl,
          }),
        ),
      };

      const body = JSON.stringify(payload);

      const blob = await new Promise<Blob>((resolve, reject) => {
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

          const progress = Math.min(
            78,
            Math.round((uploadEvent.loaded / uploadEvent.total) * 78),
          );
          setConvertProgress((prev) => Math.max(prev ?? 2, progress));
          setStatus(
            locale === "pt"
              ? `Enviando conteúdo: ${progress}%`
              : `Uploading content: ${progress}%`,
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
          setStatus(locale === "pt" ? "Gerando PDF..." : "Generating PDF...");

          processingTimer = window.setInterval(() => {
            setConvertProgress((prev) => {
              const current = prev ?? 78;
              return current >= 95 ? current : current + 1;
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

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName.replace(/\.md$/i, "") + ".pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setStatus(
        locale === "pt"
          ? "PDF gerado com sucesso (anexos incluídos no final)."
          : "PDF generated successfully (attachments included at the end).",
      );
      window.setTimeout(() => setConvertProgress(null), 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : locale === "pt"
            ? "Erro inesperado"
            : "Unexpected error";
      setStatus(
        locale === "pt"
          ? `Falha na conversão: ${message}`
          : `Conversion failed: ${message}`,
      );
      setConvertProgress(null);
    } finally {
      setLoading(false);
    }
  }

  function trackGoToPricing(area: string) {
    void trackEvent({
      eventName: "go_to_pricing",
      eventSource: "web_ui",
      path: "/",
      payload: { page: "home", area },
    });
  }

  return (
    <>
      <main className="sales-page motion-root">
        <div className="page-nav-shell motion rise-1">
          <header className="hero-nav">
            <Link href="/" className="hero-brand hero-brand-link">
              <img alt="NEXO" src="/brand/nexo_logo_primary.svg" />
              <strong>NEXO</strong>
            </Link>
            <nav>
              <Link
                href="/"
                className={isHomeActive ? "nav-link-active" : undefined}
                aria-current={isHomeActive ? "page" : undefined}
              >
                {c.navProduct}
              </Link>
              <a href="#free-converter">{c.navFree}</a>
              <Link href="/pricing">{c.navPlans}</Link>
            </nav>
            <div className="hero-nav-actions">
              <LocaleToggle />
              <ThemeToggle />
              <Link
                className="btn-nav-ghost"
                href="/pricing"
                onClick={() => trackGoToPricing("nav_access")}
              >
                {c.ctaAccess}
              </Link>
              <Link
                className="btn-nav-solid"
                href="/pricing"
                onClick={() => trackGoToPricing("nav_create")}
              >
                {c.ctaCreate}
              </Link>
            </div>
          </header>
        </div>

        <section className="nexo-hero-wrap section-transition motion rise-1">
          <div className="hero-grid motion rise-2" data-deck-group>
            <div className="deck-card">
              <p className="hero-badge">{c.heroBadge}</p>
              <h1>{c.heroTitle}</h1>
              <p className="hero-copy">{c.heroCopy}</p>
              <div className="hero-cta-row">
                <a className="btn-cta-main" href="#free-converter">
                  {c.ctaTry}
                </a>
                <Link
                  className="btn-cta-alt"
                  href="/pricing"
                  onClick={() => trackGoToPricing("hero_access")}
                >
                  {c.ctaAccess}
                </Link>
              </div>
            </div>

            <aside className="hero-points deck-card">
              <h2>{c.pointsTitle}</h2>
              <ul>
                <li>{c.points1}</li>
                <li>{c.points2}</li>
                <li>{c.points3}</li>
              </ul>
            </aside>
          </div>

          <div className="hero-showcase motion rise-3 deck-card" id="contexto">
            <div className="showcase-bar">
              <span />
              <span />
              <span />
              <strong>terminal://nexo/comunicado-v1</strong>
            </div>
            <div className="showcase-content">
              <div>
                <p>{c.showcase1}</p>
                <p>{c.showcase2}</p>
                <p>{c.showcase3}</p>
              </div>
              <div className="showcase-progress">
                <small>{c.showcaseStatus}</small>
                <div>
                  <span style={{ width: `${convertProgress ?? 64}%` }} />
                </div>
                <small>{convertProgress ?? 64}%</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section-white-grid section-transition motion rise-2">
          <div className="shell-lite">
            <p className="section-kicker">{c.sectionKicker}</p>
            <h2>{c.sectionTitle}</h2>
            <p>{c.sectionCopy}</p>
            <div className="white-cards" data-deck-group>
              <article className="deck-card">
                <strong>{c.card1t}</strong>
                <span>{c.card1d}</span>
              </article>
              <article className="deck-card">
                <strong>{c.card2t}</strong>
                <span>{c.card2d}</span>
              </article>
              <article className="deck-card">
                <strong>{c.card3t}</strong>
                <span>{c.card3d}</span>
              </article>
            </div>
          </div>
        </section>

        <section className="section-dark-feature section-transition motion rise-2">
          <div className="shell-dark surface-lift">
            <div className="feature-navline">
              <span>{c.featureTabs[0]}</span>
              <span>{c.featureTabs[1]}</span>
              <span>{c.featureTabs[2]}</span>
              <span>{c.featureTabs[3]}</span>
            </div>
            <div className="feature-panel" data-deck-group>
              <aside className="deck-card">
                <p>{c.featureTitle}</p>
                <ul>
                  <li>{c.featureItem1}</li>
                  <li>{c.featureItem2}</li>
                  <li>{c.featureItem3}</li>
                  <li>{c.featureItem4}</li>
                </ul>
              </aside>
              <div className="feature-canvas deck-card">
                <div className="feature-canvas-inner" />
              </div>
            </div>
            <div className="feature-columns" data-deck-group>
              <article className="deck-card">
                <strong>{c.feat1t}</strong>
                <p>{c.feat1d}</p>
              </article>
              <article className="deck-card">
                <strong>{c.feat2t}</strong>
                <p>{c.feat2d}</p>
              </article>
              <article className="deck-card">
                <strong>{c.feat3t}</strong>
                <p>{c.feat3d}</p>
              </article>
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
                <p className="upload-title">{c.mdDrop}</p>
                <p className="upload-subtitle">
                  {c.mdCurrent} {fileName}
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
                accept="image/*"
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
                <p className="upload-title">{c.imgDrop}</p>
                <p className="upload-subtitle">
                  {attachments.length} / {FREE_LIMITS.attachments.maxFiles}{" "}
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

              <div className="attachments-list">
                {attachments.length === 0 ? (
                  <small>{c.noAttachment}</small>
                ) : (
                  attachments.map((item) => (
                    <div className="attachment-item" key={item.id}>
                      <img alt={item.fileName} src={item.dataUrl} />
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
                <span
                  className={markdownNearLimit ? "counter-warn" : undefined}
                >
                  {markdownLength.toLocaleString(formatLocale)} /{" "}
                  {FREE_LIMITS.markdown.maxChars.toLocaleString(formatLocale)}{" "}
                  {locale === "pt" ? "caracteres" : "characters"}
                </span>
              </div>
              <textarea
                id="markdown"
                rows={14}
                maxLength={FREE_LIMITS.markdown.maxChars}
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
              />
              <small className="limit-hint">
                {c.limits} {locale === "pt" ? "até" : "up to"}{" "}
                {FREE_LIMITS.markdown.maxChars.toLocaleString(formatLocale)}{" "}
                {locale === "pt"
                  ? "caracteres de markdown, até"
                  : "markdown characters, up to"}{" "}
                {FREE_LIMITS.attachments.maxFiles}{" "}
                {locale === "pt" ? "anexos," : "attachments,"}{" "}
                {formatBytes(FREE_LIMITS.attachments.maxFileBytes)}{" "}
                {locale === "pt" ? "por anexo e" : "per attachment and"}{" "}
                {formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}{" "}
                {locale === "pt" ? "no total. Tipos:" : "total. Types:"}{" "}
                {FREE_LIMITS.attachments.allowedMimeTypes.join(", ")}.
              </small>

              <div className="submit-row">
                <button disabled={loading || !markdown.trim()} type="submit">
                  {loading ? c.converting : c.generate}
                </button>
                <small className="status-text">{status}</small>
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
            </form>

            <article className="converter-panel preview-panel deck-card">
              <div className="output-head">
                <h3>Preview do markdown</h3>
                <small>{fileName}</small>
              </div>
              <pre>{markdown}</pre>
            </article>
          </div>

          <div className="bottom-cta deck-card">
            <p>{c.bottomCta}</p>
            <Link
              className="btn-cta-main"
              href="/pricing"
              onClick={() => trackGoToPricing("bottom_cta")}
            >
              {c.ctaAccess}
            </Link>
          </div>
        </section>
      </main>
      <div className="page-footer-wrap">
        <SiteFooter />
      </div>
    </>
  );
}
