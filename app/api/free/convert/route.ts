import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { FREE_LIMITS, formatBytes } from "@/lib/config/free-limits";
import { buildPdfFromMarkdown } from "@/lib/services/pdf/simple-pdf";

export const runtime = "nodejs";

const dataUrlPattern = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/;

const attachmentSchema = z.object({
  fileName: z.string().trim().min(1).max(FREE_LIMITS.fileName.maxChars),
  mimeType: z.string().trim().min(1),
  dataUrl: z.string().trim().min(1)
});

const requestSchema = z.object({
  markdown: z.string().trim().min(1).max(FREE_LIMITS.markdown.maxChars),
  fileName: z.string().trim().max(FREE_LIMITS.fileName.maxChars).optional(),
  attachments: z.array(attachmentSchema).max(FREE_LIMITS.attachments.maxFiles).default([])
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
          message: "Revise os limites de markdown, nome de arquivo e anexos.",
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

  const sourceName = sanitizeSourceName(parsed.data.fileName);
  const markdownChars = parsed.data.markdown.length;
  const attachmentsCount = parsed.data.attachments.length;
  let totalAttachmentBytes = 0;
  for (const attachment of parsed.data.attachments) {
    const dataUrl = extractDataUrlInfo(attachment.dataUrl);
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

    if (attachment.mimeType.toLowerCase() !== dataUrl.mimeType) {
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

  const fileName = `${sourceName}.pdf`;

  try {
    const bytes = await buildPdfFromMarkdown({
      markdown: parsed.data.markdown,
      sourceName,
      attachments: parsed.data.attachments
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
