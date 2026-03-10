import { z } from "zod";
import { createHash } from "node:crypto";
import { sendWaitlistConfirmationEmail } from "@/lib/services/notifications/waitlist-confirmation";

export const runtime = "nodejs";

const waitlistSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  company: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  useCase: z.string().trim().max(700).optional().default(""),
  locale: z.enum(["pt", "en"]).optional().default("pt")
});

type WaitlistEntry = z.infer<typeof waitlistSchema> & {
  createdAt: string;
};

type EventLogEntry = {
  eventName: string;
  eventSource: string;
  path: string;
  referrer: string;
  userAgent: string;
  ipHash: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

async function insertWaitlistEntry(entry: WaitlistEntry) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("supabase_env_missing");
  }

  const response = await fetch(`${config.url}/rest/v1/waitlist_entries`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      prefer: "return=representation"
    },
    body: JSON.stringify({
      name: entry.name,
      email: entry.email,
      company: entry.company,
      role: entry.role,
      use_case: entry.useCase,
      created_at: entry.createdAt
    }),
    cache: "no-store"
  });

  if (response.ok) {
    return;
  }

  const errorBody = await response.json().catch(() => ({}));
  const code = typeof errorBody?.code === "string" ? errorBody.code : "";

  // Postgres unique violation (e.g. unique index on lower(email)).
  if (response.status === 409 || code === "23505") {
    throw new Error("waitlist_email_exists");
  }

  throw new Error("waitlist_insert_failed");
}

async function insertEventLog(entry: EventLogEntry) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("supabase_env_missing");
  }

  const response = await fetch(`${config.url}/rest/v1/event_log`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      prefer: "return=minimal"
    },
    body: JSON.stringify({
      event_name: entry.eventName,
      event_source: entry.eventSource,
      path: entry.path,
      referrer: entry.referrer,
      user_agent: entry.userAgent,
      ip_hash: entry.ipHash,
      payload: entry.payload,
      created_at: entry.createdAt
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("event_log_insert_failed");
  }
}

function getClientIpHash(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const candidate = forwardedFor.split(",")[0]?.trim() || realIp.trim();
  if (!candidate) {
    return "";
  }

  return createHash("sha256").update(candidate).digest("hex");
}

function buildRequestContext(request: Request) {
  const url = new URL(request.url);
  return {
    path: `${url.pathname}${url.search}`,
    referrer: request.headers.get("referer") ?? "",
    userAgent: request.headers.get("user-agent") ?? "",
    ipHash: getClientIpHash(request)
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "invalid_json", message: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "invalid_payload",
        message: "Revise os campos obrigatórios do formulário.",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const entry: WaitlistEntry = {
    ...parsed.data,
    createdAt: new Date().toISOString()
  };
  const requestContext = buildRequestContext(request);

  try {
    await insertWaitlistEntry(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "waitlist_insert_failed";

    if (message === "supabase_env_missing") {
      return Response.json(
        {
          error: "misconfigured_server",
          message: "Configuração de ambiente incompleta para registrar a lista de interesse."
        },
        { status: 500 }
      );
    }

    if (message === "waitlist_email_exists") {
      return Response.json(
        {
          error: "email_already_registered",
          message: "Este e-mail já foi registrado na lista de interesse."
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        error: "waitlist_insert_failed",
        message: "Não foi possível registrar seu interesse no momento."
      },
      { status: 500 }
    );
  }

  // Best effort: event logging must not break core waitlist flow.
  try {
    await insertEventLog({
      eventName: "waitlist_submitted",
      eventSource: "web",
      path: requestContext.path,
      referrer: requestContext.referrer,
      userAgent: requestContext.userAgent,
      ipHash: requestContext.ipHash,
      payload: {
        email_domain: entry.email.split("@")[1]?.toLowerCase() ?? "",
        company: entry.company,
        role: entry.role
      },
      createdAt: entry.createdAt
    });
  } catch {
    // Intentionally ignored.
  }

  // Best effort: confirmation e-mail must not break waitlist flow.
  try {
    const emailResult = await sendWaitlistConfirmationEmail({
      name: entry.name,
      email: entry.email,
      locale: entry.locale
    });

    await insertEventLog({
      eventName: "waitlist_confirmation_email",
      eventSource: "web",
      path: requestContext.path,
      referrer: requestContext.referrer,
      userAgent: requestContext.userAgent,
      ipHash: requestContext.ipHash,
      payload: {
        email_domain: entry.email.split("@")[1]?.toLowerCase() ?? "",
        locale: entry.locale,
        status: emailResult.status,
        reason: "reason" in emailResult ? emailResult.reason : ""
      },
      createdAt: new Date().toISOString()
    });
  } catch {
    // Intentionally ignored.
  }

  return Response.json(
    {
      ok: true,
      message: "Cadastro de interesse registrado com sucesso. Enviamos um e-mail de confirmação."
    },
    { status: 201 }
  );
}
