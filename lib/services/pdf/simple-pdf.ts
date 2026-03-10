import MarkdownIt from "markdown-it";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright";

type AttachmentInput = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
};

type BuildPdfInput = {
  markdown: string;
  sourceName: string;
  attachments: AttachmentInput[];
};

const HEADER_LOGO_CANDIDATES = ["nexo_logo_primary.svg", "nexo_logo_primary.png"];
const WATERMARK_LOGO_CANDIDATES = ["nexo_logo_primary_mono.svg", "nexo_logo_primary.svg", "nexo_logo_primary_mono.png"];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chunkAttachments(attachments: AttachmentInput[], size: number) {
  const chunks: AttachmentInput[][] = [];
  for (let i = 0; i < attachments.length; i += size) {
    chunks.push(attachments.slice(i, i + size));
  }
  return chunks;
}

function resolveBrandAssetDataUrl(candidates: string[]) {
  for (const fileName of candidates) {
    const absolutePath = join(process.cwd(), "public", "brand", fileName);
    if (!existsSync(absolutePath)) {
      continue;
    }

    const extension = extname(fileName).toLowerCase();
    const mimeType = extension === ".svg" ? "image/svg+xml" : "image/png";
    const encoded = readFileSync(absolutePath).toString("base64");
    return `data:${mimeType};base64,${encoded}`;
  }

  return "";
}

function buildDocumentHtml(
  input: BuildPdfInput,
  generatedAt: string,
  headerLogoDataUrl: string,
  watermarkLogoDataUrl: string
) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: true });
  const contentHtml = md.render(input.markdown);

  const attachmentPages = chunkAttachments(input.attachments, 2)
    .map((page, pageIndex) => {
      const cards = page
        .map((item, itemIndex) => {
          return `
            <article class="attachment-card">
              <header>
                <span>${pageIndex * 2 + itemIndex + 1}.</span>
                <strong>${escapeHtml(item.fileName)}</strong>
              </header>
              <div class="image-box">
                <div class="image-fit" style="background-image: url('${item.dataUrl}');" aria-label="${escapeHtml(item.fileName)}"></div>
              </div>
            </article>
          `;
        })
        .join("\n");

      return `
        <section class="appendix-page" data-page-index="${pageIndex}">
          ${cards}
        </section>
      `;
    })
    .join("\n");

  const appendixHtml =
    input.attachments.length === 0
      ? ""
      : `
      <section class="appendix">
        <h2>Anexos</h2>
        <p class="appendix-subtitle">Evidencias visuais anexadas ao final do documento</p>
        ${attachmentPages}
      </section>
    `;

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(input.sourceName)}</title>
        <style>
          @page {
            size: A4;
            margin: 16mm 14mm 18mm;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            font-family: "Inter", "Segoe UI", system-ui, sans-serif;
            color: #132444;
            background: #ffffff;
            line-height: 1.45;
            position: relative;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .pdf-watermark {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            pointer-events: none;
            z-index: 0;
          }

          .pdf-watermark img {
            width: 220px;
            height: 220px;
            object-fit: contain;
            opacity: 0.024;
            filter: grayscale(100%);
          }

          .pdf-watermark span {
            font-size: 72px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #1e4d8f;
            opacity: 0.024;
            transform: rotate(-20deg);
          }

          .doc-header {
            padding: 12px 14px;
            border-radius: 10px;
            background: linear-gradient(135deg, #0f2046 0%, #183a7a 100%);
            color: #f5f8ff;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
            page-break-after: avoid;
            break-after: avoid-page;
          }

          .doc-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: nowrap;
          }

          .brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
          }

          .brand img {
            width: 14px;
            height: 14px;
            object-fit: contain;
          }

          .brand strong {
            font-size: 20px;
            line-height: 1;
            letter-spacing: -0.01em;
          }

          .source {
            max-width: 60%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            color: #d2e1ff;
          }

          .content {
            padding: 14px 16px 10px;
            background: linear-gradient(180deg, #f8fbff 0%, #f3f8ff 100%);
            border: 1px solid #e5edf9;
            border-radius: 10px;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
            position: relative;
            z-index: 1;
          }

          .content h1,
          .content h2,
          .content h3 {
            color: #0e2248;
            margin: 1em 0 0.45em;
            line-height: 1.2;
            page-break-after: avoid;
            break-after: avoid-page;
          }

          .content h1 { font-size: 22px; }
          .content h2 { font-size: 18px; }
          .content h3 { font-size: 15px; }

          .content p,
          .content li {
            font-size: 12.5px;
            orphans: 3;
            widows: 3;
          }

          .content p,
          .content li,
          .content blockquote,
          .content pre,
          .content table {
            page-break-inside: avoid;
            break-inside: avoid-page;
          }

          .content pre,
          .content code {
            font-family: "JetBrains Mono", "Consolas", monospace;
          }

          .content pre {
            padding: 10px;
            border-radius: 8px;
            background: #eaf0fc;
            border: 1px solid #ccdaf6;
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 11px;
          }

          .content code {
            font-size: 11px;
            background: #eaf0fc;
            border: 1px solid #d8e3f8;
            border-radius: 6px;
            padding: 1px 4px;
          }

          .content ul,
          .content ol {
            margin: 0.4em 0 0.8em;
            padding-left: 20px;
          }

          .content > *:first-child {
            margin-top: 0;
          }

          .content > *:last-child {
            margin-bottom: 0;
          }

          .appendix {
            margin-top: 10px;
            page-break-before: always;
            position: relative;
            z-index: 1;
          }

          .appendix h2 {
            margin: 0 0 4px;
            font-size: 22px;
            color: #10264f;
          }

          .appendix-subtitle {
            margin: 0 0 10px;
            font-size: 12px;
            color: #506a95;
          }

          .appendix-page {
            display: grid;
            gap: 8mm;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .appendix-page + .appendix-page {
            page-break-before: always;
          }

          .attachment-card {
            border: 1px solid #cfdcf6;
            border-radius: 10px;
            padding: 3.2mm;
            background: #f8faff;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .attachment-card header {
            display: flex;
            gap: 8px;
            align-items: baseline;
            margin-bottom: 8px;
            color: #193667;
            font-size: 12px;
          }

          .attachment-card header span {
            font-weight: 700;
          }

          .image-box {
            height: 88mm;
            border: 1px dashed #9cb3dd;
            border-radius: 8px;
            background: linear-gradient(180deg, #eef4ff 0%, #e7effe 100%);
            display: grid;
            place-items: center;
            padding: 3mm;
            overflow: hidden;
          }

          .image-fit {
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
            border-radius: 6px;
            background-color: #dbe7ff;
          }
        </style>
      </head>
      <body>
        <div class="pdf-watermark">
          ${
            watermarkLogoDataUrl
              ? `<img src="${watermarkLogoDataUrl}" alt="NEXO watermark" />`
              : `<span>NEXO</span>`
          }
        </div>

        <header class="doc-header">
          <div class="doc-header-row">
            <div class="brand">
              ${headerLogoDataUrl ? `<img src="${headerLogoDataUrl}" alt="NEXO logo" />` : ""}
              <strong>NEXO</strong>
            </div>
            <span class="source">Fonte: ${escapeHtml(input.sourceName)}</span>
          </div>
        </header>

        <main>
          <section class="content">${contentHtml}</section>
          ${appendixHtml}
        </main>
      </body>
    </html>
  `;
}

function buildFooterTemplate(generatedAt: string) {
  const escapedGeneratedAt = escapeHtml(generatedAt);

  return `
    <div style="
      width: 100%;
      font-family: Inter, 'Segoe UI', system-ui, sans-serif;
      font-size: 9px;
      color: #4b638d;
      padding: 2mm 14mm 4mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #d7e2f4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    ">
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 16px;
        padding: 0 7px;
        border-radius: 999px;
        border: 1px solid #b7c9ea;
        color: #1f4b8f;
        background: #edf3ff;
        font-weight: 700;
        letter-spacing: 0.35px;
      ">FREE</span>
      <span>Gerado em ${escapedGeneratedAt} · Pagina <span class="pageNumber"></span>/<span class="totalPages"></span></span>
    </div>
  `;
}

export async function buildPdfFromMarkdown(input: BuildPdfInput) {
  const generatedAt = new Date().toLocaleString("pt-BR", { hour12: false });
  const headerLogoDataUrl = resolveBrandAssetDataUrl(HEADER_LOGO_CANDIDATES);
  const watermarkLogoDataUrl = resolveBrandAssetDataUrl(WATERMARK_LOGO_CANDIDATES);
  const html = buildDocumentHtml(input, generatedAt, headerLogoDataUrl, watermarkLogoDataUrl);
  const explicitExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

  let browser;
  try {
    browser = explicitExecutablePath
      ? await chromium.launch({ headless: true, executablePath: explicitExecutablePath })
      : await chromium.launch({ headless: true });
  } catch {
    try {
      // Fallback to the locally installed Google Chrome when Playwright Chromium is missing.
      browser = await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      throw new Error(
        "chromium_missing: execute 'yarn playwright install chromium' (ou defina PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)"
      );
    }
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: buildFooterTemplate(generatedAt),
      margin: {
        top: "16mm",
        right: "14mm",
        bottom: "22mm",
        left: "14mm"
      },
      preferCSSPageSize: false
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
