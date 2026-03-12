import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { FREE_LIMITS, formatBytes } from "@/lib/config/free-limits";
import { buildPdfFromMarkdown } from "@/lib/services/pdf/simple-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const dataUrlPattern = /^data:([^;,]+)(?:;[^,]+)*;base64,([A-Za-z0-9+/=]+)$/;

const attachmentSchema = z.object({
  fileName: z.string().trim().min(1).max(FREE_LIMITS.fileName.maxChars),
  mimeType: z.string().trim().min(1),
  dataUrl: z.string().trim().min(1)
});

const customLogoSchema = attachmentSchema.extend({
  tone: z.enum(["dark", "light"]).default("dark")
});

const documentSchema = z.object({
  markdown: z.string().trim().min(1).max(FREE_LIMITS.markdown.maxChars),
  fileName: z.string().trim().min(1).max(FREE_LIMITS.fileName.maxChars),
  attachments: z
    .array(attachmentSchema)
    .max(FREE_LIMITS.attachments.maxFilesPerDocument)
    .default([])
});

const requestSchema = z.object({
  documents: z
    .array(documentSchema)
    .min(1)
    .max(FREE_LIMITS.documents.maxFiles),
  customLogo: customLogoSchema.optional()
});

function extractDataUrlInfo(dataUrl: string) {
  const match = dataUrlPattern.exec(dataUrl);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((base64.length * 3) / 4) - padding;

  return { mimeType, bytes };
}

function normalizeMimeType(fileName: string, mimeType: string) {
  const normalized = mimeType.trim().toLowerCase();
  if (normalized) {
    return normalized;
  }

  const lowerName = fileName.toLowerCase();
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

  return normalized;
}

function sanitizeSourceName(fileName?: string) {
  const base = (fileName ?? "documento")
    .replace(/\.md$/i, "")
    .replace(/[^\w.\- ]+/g, " ")
    .trim()
    .slice(0, FREE_LIMITS.fileName.maxChars);

  return base.length > 0 ? base : "documento";
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

function getClientIpHash(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const candidate = forwardedFor.split(",")[0]?.trim() || realIp.trim();
  if (!candidate) {
    return "";
  }

  return createHash("sha256").update(candidate).digest("hex");
}

type FreeRunLogInput = {
  path: string;
  referrer: string;
  userAgent: string;
  ipHash: string;
  sourceName: string;
  markdownChars: number;
  attachmentsCount: number;
  attachmentsTotalBytes: number;
  requestBytes: number;
  status: "success" | "validation_error" | "failed";
  errorCode: string;
  durationMs: number;
  createdAt: string;
};

async function insertFreeRunLog(input: FreeRunLogInput) {
  const config = getSupabaseConfig();
  if (!config) {
    return;
  }

  await fetch(`${config.url}/rest/v1/free_runs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      prefer: "return=minimal"
    },
    body: JSON.stringify({
      event_source: "free_converter",
      path: input.path,
      referrer: input.referrer,
      user_agent: input.userAgent,
      ip_hash: input.ipHash,
      source_name: input.sourceName,
      markdown_chars: input.markdownChars,
      attachments_count: input.attachmentsCount,
      attachments_total_bytes: input.attachmentsTotalBytes,
      request_bytes: input.requestBytes,
      status: input.status,
      error_code: input.errorCode,
      duration_ms: input.durationMs,
      created_at: input.createdAt
    }),
    cache: "no-store"
  });
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const createdAt = new Date().toISOString();
  const url = new URL(request.url);
  const path = `${url.pathname}${url.search}`;
  const referrer = request.headers.get("referer") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const ipHash = getClientIpHash(request);

  const contentLengthHeader = request.headers.get("content-length");
  const requestBytes = contentLengthHeader && Number.isFinite(Number(contentLengthHeader)) ? Number(contentLengthHeader) : 0;

  const finalize = async (
    response: Response,
    status: "success" | "validation_error" | "failed",
    errorCode: string,
    sourceName: string,
    markdownChars: number,
    attachmentsCount: number,
    attachmentsTotalBytes: number
  ) => {
    try {
      await insertFreeRunLog({
        path,
        referrer,
        userAgent,
        ipHash,
        sourceName,
        markdownChars,
        attachmentsCount,
        attachmentsTotalBytes,
        requestBytes,
        status,
        errorCode,
        durationMs: Math.max(0, Date.now() - startedAt),
        createdAt
      });
    } catch {
      // Best effort logging only.
    }

    return response;
  };

  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > FREE_LIMITS.request.maxBodyBytes) {
      return finalize(
        Response.json(
          {
            error: "payload_too_large",
            message: `Payload acima do limite (${formatBytes(FREE_LIMITS.request.maxBodyBytes)}).`
          },
          { status: 413 }
        ),
        "validation_error",
        "payload_too_large",
        "documento",
        0,
        0,
        0
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return finalize(
      Response.json({ error: "invalid_json", message: "JSON inválido no corpo da requisição." }, { status: 400 }),
      "validation_error",
      "invalid_json",
      "documento",
      0,
      0,
      0
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return finalize(
      Response.json(
        {
          error: "invalid_payload",
          message: "Revise os limites de documentos, markdown, nome de arquivo e anexos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      ),
      "validation_error",
      "invalid_payload",
      "documento",
      0,
      0,
      0
    );
  }

  const sourceName = sanitizeSourceName(parsed.data.documents[0]?.fileName);
  const markdownChars = parsed.data.documents.reduce(
    (sum, item) => sum + item.markdown.length,
    0
  );
  const attachmentsCount = parsed.data.documents.reduce(
    (sum, item) => sum + item.attachments.length,
    0
  );
  const customLogo = parsed.data.customLogo;
  let totalAttachmentBytes = 0;
  if (markdownChars > FREE_LIMITS.documents.maxTotalChars) {
    return finalize(
      Response.json(
        {
          error: "markdown_too_large",
          message: `Total de markdown excede ${FREE_LIMITS.documents.maxTotalChars.toLocaleString("pt-BR")} caracteres.`
        },
        { status: 413 }
      ),
      "validation_error",
      "markdown_too_large",
      sourceName,
      markdownChars,
      attachmentsCount,
      totalAttachmentBytes
    );
  }

  if (attachmentsCount > FREE_LIMITS.attachments.maxFiles) {
    return finalize(
      Response.json(
        {
          error: "too_many_attachments",
          message: `Total de anexos excede ${FREE_LIMITS.attachments.maxFiles}.`
        },
        { status: 413 }
      ),
      "validation_error",
      "too_many_attachments",
      sourceName,
      markdownChars,
      attachmentsCount,
      totalAttachmentBytes
    );
  }

  for (const document of parsed.data.documents) {
    for (const attachment of document.attachments) {
      const dataUrl = extractDataUrlInfo(attachment.dataUrl);
      const normalizedMimeType = normalizeMimeType(
        attachment.fileName,
        attachment.mimeType
      );
      if (!dataUrl) {
        return finalize(
          Response.json(
            { error: "invalid_attachment_data", message: `Anexo "${attachment.fileName}" com data URL inválida.` },
            { status: 400 }
          ),
          "validation_error",
          "invalid_attachment_data",
          sourceName,
          markdownChars,
          attachmentsCount,
          totalAttachmentBytes
        );
      }

      if (!FREE_LIMITS.attachments.allowedMimeTypes.includes(dataUrl.mimeType as (typeof FREE_LIMITS.attachments.allowedMimeTypes)[number])) {
        return finalize(
          Response.json(
            {
              error: "unsupported_attachment_type",
              message: `Formato não permitido em "${attachment.fileName}". Tipos aceitos: ${FREE_LIMITS.attachments.allowedMimeTypes.join(", ")}.`
            },
            { status: 415 }
          ),
          "validation_error",
          "unsupported_attachment_type",
          sourceName,
          markdownChars,
          attachmentsCount,
          totalAttachmentBytes
        );
      }

      if (normalizedMimeType !== dataUrl.mimeType) {
        return finalize(
          Response.json(
            { error: "mime_mismatch", message: `Tipo MIME inconsistente no anexo "${attachment.fileName}".` },
            { status: 400 }
          ),
          "validation_error",
          "mime_mismatch",
          sourceName,
          markdownChars,
          attachmentsCount,
          totalAttachmentBytes
        );
      }

      if (dataUrl.bytes > FREE_LIMITS.attachments.maxFileBytes) {
        return finalize(
          Response.json(
            {
              error: "attachment_too_large",
              message: `Anexo "${attachment.fileName}" excede ${formatBytes(FREE_LIMITS.attachments.maxFileBytes)}.`
            },
            { status: 413 }
          ),
          "validation_error",
          "attachment_too_large",
          sourceName,
          markdownChars,
          attachmentsCount,
          totalAttachmentBytes
        );
      }

      totalAttachmentBytes += dataUrl.bytes;
    }
  }

  if (totalAttachmentBytes > FREE_LIMITS.attachments.maxTotalBytes) {
    return finalize(
      Response.json(
        {
          error: "attachments_too_large",
          message: `Total de anexos excede ${formatBytes(FREE_LIMITS.attachments.maxTotalBytes)}.`
        },
        { status: 413 }
      ),
      "validation_error",
      "attachments_too_large",
      sourceName,
      markdownChars,
      attachmentsCount,
      totalAttachmentBytes
    );
  }

  if (customLogo) {
    const logoDataUrl = extractDataUrlInfo(customLogo.dataUrl);
    const normalizedLogoMimeType = normalizeMimeType(
      customLogo.fileName,
      customLogo.mimeType
    );
    if (!logoDataUrl) {
      return finalize(
        Response.json(
          { error: "invalid_logo_data", message: `Logo "${customLogo.fileName}" com data URL inválida.` },
          { status: 400 }
        ),
        "validation_error",
        "invalid_logo_data",
        sourceName,
        markdownChars,
        attachmentsCount,
        totalAttachmentBytes
      );
    }

    if (
      !FREE_LIMITS.branding.allowedMimeTypes.includes(
        logoDataUrl.mimeType as (typeof FREE_LIMITS.branding.allowedMimeTypes)[number]
      )
    ) {
      return finalize(
        Response.json(
          {
            error: "unsupported_logo_type",
            message: `Formato não permitido em "${customLogo.fileName}". Tipos aceitos: ${FREE_LIMITS.branding.allowedMimeTypes.join(", ")}.`
          },
          { status: 415 }
        ),
        "validation_error",
        "unsupported_logo_type",
        sourceName,
        markdownChars,
        attachmentsCount,
        totalAttachmentBytes
      );
    }

    if (normalizedLogoMimeType !== logoDataUrl.mimeType) {
      return finalize(
        Response.json(
          { error: "logo_mime_mismatch", message: `Tipo MIME inconsistente na logo "${customLogo.fileName}".` },
          { status: 400 }
        ),
        "validation_error",
        "logo_mime_mismatch",
        sourceName,
        markdownChars,
        attachmentsCount,
        totalAttachmentBytes
      );
    }

    if (logoDataUrl.bytes > FREE_LIMITS.branding.maxLogoBytes) {
      return finalize(
        Response.json(
          {
            error: "logo_too_large",
            message: `Logo "${customLogo.fileName}" excede ${formatBytes(FREE_LIMITS.branding.maxLogoBytes)}.`
          },
          { status: 413 }
        ),
        "validation_error",
        "logo_too_large",
        sourceName,
        markdownChars,
        attachmentsCount,
        totalAttachmentBytes
      );
    }
  }

  const fileName = `${sourceName}.pdf`;

  try {
    const bytes = await buildPdfFromMarkdown({
      sourceName,
      documents: parsed.data.documents.map((document) => ({
        markdown: document.markdown,
        sourceName: sanitizeSourceName(document.fileName),
        attachments: document.attachments
      })),
      customLogo: parsed.data.customLogo ?? null
    });

    return finalize(
      new Response(bytes, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="${fileName}"`,
          "cache-control": "no-store"
        }
      }),
      "success",
      "",
      sourceName,
      markdownChars,
      attachmentsCount,
      totalAttachmentBytes
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "conversion_failed";
    return finalize(
      Response.json({ error: "pdf_generation_failed", message }, { status: 500 }),
      "failed",
      "pdf_generation_failed",
      sourceName,
      markdownChars,
      attachmentsCount,
      totalAttachmentBytes
    );
  }
}
