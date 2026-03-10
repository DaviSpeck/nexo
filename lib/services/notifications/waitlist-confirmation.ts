import { CONTACTS } from "@/lib/contacts";

type SupportedLocale = "pt" | "en";

type WaitlistConfirmationInput = {
  name: string;
  email: string;
  locale: SupportedLocale;
};

type SendResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailLayout(params: {
  preheader: string;
  eyebrow: string;
  title: string;
  greeting: string;
  summary: string;
  detail: string;
  sectionTitle: string;
  sectionItems: string[];
  supportTitle: string;
  supportSubtitle: string;
  emailLabel: string;
  whatsappLabel: string;
  supportButton: string;
  whatsappButton: string;
  footerText: string;
}) {
  const sectionList = params.sectionItems.map((item) => `<li style="margin: 0 0 8px;">${item}</li>`).join("");

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>NEXO</title>
    </head>
    <body style="margin: 0; padding: 0; background: #eef3fb; font-family: Arial, Helvetica, sans-serif; color: #0f2446;">
      <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
        ${params.preheader}
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #eef3fb; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #ffffff; border: 1px solid #d6e2f4; border-radius: 16px; overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(125deg, #0f2e5c 0%, #123e77 100%); padding: 20px 24px;">
                  <p style="margin: 0; color: #95b7ef; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;">${params.eyebrow}</p>
                  <h1 style="margin: 8px 0 0; color: #eef5ff; font-size: 24px; line-height: 1.25;">${params.title}</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 22px 24px 10px;">
                  <p style="margin: 0; font-size: 20px; font-weight: 700; color: #102a4f;">${params.greeting}</p>
                  <p style="margin: 12px 0 0; font-size: 16px; line-height: 1.6; color: #24446f;">${params.summary}</p>
                  <p style="margin: 10px 0 0; font-size: 15px; line-height: 1.6; color: #3a5a86;">${params.detail}</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 14px 24px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #cfe0f6; border-radius: 12px; background: #f7faff;">
                    <tr>
                      <td style="padding: 16px 16px 6px;">
                        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #143863;">${params.sectionTitle}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 16px 12px;">
                        <ul style="margin: 0; padding-left: 18px; color: #32537e; font-size: 14px; line-height: 1.55;">
                          ${sectionList}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 16px 24px 0;">
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #143863;">${params.supportTitle}</p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #456487;">${params.supportSubtitle}</p>
                  <p style="margin: 10px 0 0; font-size: 14px; color: #34557f;">
                    ${params.emailLabel}: <a href="mailto:${CONTACTS.supportEmail}" style="color: #0f63c9; text-decoration: none;">${CONTACTS.supportEmail}</a><br />
                    ${params.whatsappLabel}: <a href="https://wa.me/${CONTACTS.whatsappDigits}" style="color: #0f63c9; text-decoration: none;">${CONTACTS.whatsappDisplay}</a>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 18px 24px 6px;">
                  <a href="mailto:${CONTACTS.supportEmail}" style="display: inline-block; margin: 0 8px 8px 0; border-radius: 999px; background: #123f78; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 16px;">${params.supportButton}</a>
                  <a href="https://wa.me/${CONTACTS.whatsappDigits}" style="display: inline-block; margin: 0 8px 8px 0; border-radius: 999px; background: #1cb48f; color: #0c243f; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 16px;">${params.whatsappButton}</a>
                </td>
              </tr>

              <tr>
                <td style="padding: 14px 24px 20px;">
                  <p style="margin: 0; font-size: 12px; color: #6f88ac;">
                    ${params.footerText}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function buildMessage(input: WaitlistConfirmationInput) {
  const safeName = escapeHtml(input.name.trim() || "there");

  if (input.locale === "en") {
    const html = buildEmailLayout({
      preheader: "Your NEXO waitlist registration has been confirmed.",
      eyebrow: "NEXO · WAITLIST",
      title: "Registration confirmed",
      greeting: `Hi, ${safeName}.`,
      summary: "Thanks for joining the NEXO waitlist.",
      detail: "Your registration has been received and we will contact you as soon as new access batches are available.",
      sectionTitle: "What happens next",
      sectionItems: [
        "Your e-mail has been added to the release contact list.",
        "Access invites are sent in controlled batches.",
        "Early feedback will help define feature priorities."
      ],
      supportTitle: "Need help?",
      supportSubtitle: "Our team is available for operational questions and onboarding context.",
      emailLabel: "E-mail",
      whatsappLabel: "WhatsApp",
      supportButton: "Contact support",
      whatsappButton: "Open WhatsApp",
      footerText: "NEXO by SPECK TECH SOLUTIONS LTDA."
    });

    return {
      subject: "NEXO waitlist confirmation",
      html,
      text: [
        `Hi, ${input.name.trim() || "there"}.`,
        "",
        "Thanks for joining the NEXO waitlist.",
        "Your registration has been received and we will contact you when new access batches are available.",
        "",
        "What happens next:",
        "- Your e-mail has been added to the release contact list.",
        "- Access invites are sent in controlled batches.",
        "- Early feedback will help define feature priorities.",
        "",
        `Support e-mail: ${CONTACTS.supportEmail}`,
        `WhatsApp: ${CONTACTS.whatsappDisplay} (https://wa.me/${CONTACTS.whatsappDigits})`,
        "",
        "NEXO Team"
      ].join("\n")
    };
  }

  const html = buildEmailLayout({
    preheader: "Seu cadastro na lista de interesse da NEXO foi confirmado.",
    eyebrow: "NEXO · LISTA DE INTERESSE",
    title: "Cadastro confirmado",
    greeting: `Olá, ${safeName}.`,
    summary: "Obrigado por entrar na lista de interesse da NEXO.",
    detail: "Seu cadastro foi recebido e vamos avisar assim que abrirmos novos lotes de acesso.",
    sectionTitle: "Próximos passos",
    sectionItems: [
      "Seu e-mail foi incluído na lista de comunicação de liberação.",
      "Convites de acesso serão enviados em lotes controlados.",
      "Feedback inicial ajudará a definir prioridades de evolução."
    ],
    supportTitle: "Precisa de suporte?",
    supportSubtitle: "Nosso time está disponível para dúvidas operacionais e contexto de uso.",
    emailLabel: "E-mail",
    whatsappLabel: "WhatsApp",
    supportButton: "Falar com suporte",
    whatsappButton: "Abrir WhatsApp",
    footerText: "NEXO by SPECK TECH SOLUTIONS LTDA."
  });

  return {
    subject: "Confirmação de cadastro na lista de interesse da NEXO",
    html,
    text: [
      `Olá, ${input.name.trim() || "pessoa usuária"}.`,
      "",
      "Obrigado por entrar na lista de interesse da NEXO.",
      "Seu cadastro foi recebido e vamos avisar quando abrirmos novos lotes de acesso.",
      "",
      "Próximos passos:",
      "- Seu e-mail foi incluído na lista de comunicação de liberação.",
      "- Convites de acesso serão enviados em lotes controlados.",
      "- Feedback inicial ajudará a definir prioridades de evolução.",
      "",
      `Suporte: ${CONTACTS.supportEmail}`,
      `WhatsApp: ${CONTACTS.whatsappDisplay} (https://wa.me/${CONTACTS.whatsappDigits})`,
      "",
      "Time NEXO"
    ].join("\n")
  };
}

export async function sendWaitlistConfirmationEmail(input: WaitlistConfirmationInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { status: "skipped", reason: "resend_key_missing" };
  }

  const fromEmail = process.env.WAITLIST_EMAIL_FROM ?? `NEXO <${CONTACTS.notificationEmail}>`;
  const replyTo = process.env.WAITLIST_EMAIL_REPLY_TO ?? CONTACTS.supportEmail;
  const message = buildMessage(input);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [input.email],
        reply_to: replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return { status: "failed", reason: "resend_request_failed" };
    }

    return { status: "sent" };
  } catch {
    return { status: "failed", reason: "resend_request_exception" };
  }
}
