import LegalTemplate from "@/components/legal-template";
import { CONTACTS, CONTACT_LINKS } from "@/lib/contacts";

export default function SupportPage() {
  return (
    <LegalTemplate
      titlePt="Central de Suporte"
      titleEn="Support Center"
      updatedLabelPt="Atualizado em"
      updatedLabelEn="Updated on"
      updatedDate="10/03/2026"
      childrenPt={
        <>
          <h2>Como falar com a NEXO</h2>
          <p>
            Para dúvidas operacionais, erros técnicos, segurança ou feedback de produto, envie e-mail para{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>
          <p>
            Sempre inclua: URL da página, horário aproximado do problema, mensagem de erro exibida e
            passos para reproduzir.
          </p>
          <p>
            Canal rápido:{" "}
            <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp {CONTACTS.whatsappDisplay}
            </a>.
          </p>

          <h2>Horário de atendimento</h2>
          <p>Segunda a sexta, 09:00-18:00 (America/Sao_Paulo), exceto feriados locais.</p>

          <h2>Prazo de primeira resposta</h2>
          <ul>
            <li>Crítico (indisponibilidade total): até 4 horas úteis.</li>
            <li>Alto (erro recorrente sem contorno): até 8 horas úteis.</li>
            <li>Médio/Baixo (dúvidas, ajustes e melhorias): até 1 dia útil.</li>
          </ul>

          <h2>Escopo de suporte atual</h2>
          <ul>
            <li>Fluxo Free de importação de markdown e geração de PDF.</li>
            <li>Cadastro na lista de interesse e confirmação de envio.</li>
            <li>Problemas de idioma, tema e navegação entre Home e Pricing.</li>
            <li>Esclarecimentos sobre limitações e privacidade da sessão Free.</li>
          </ul>

          <h2>Escopo fora do suporte</h2>
          <ul>
            <li>Customização de documentos internos da sua empresa.</li>
            <li>Treinamento formal e consultoria operacional dedicada.</li>
            <li>Integrações avançadas ainda não liberadas na área autenticada.</li>
          </ul>

          <h2>Status do atendimento</h2>
          <p>
            Você receberá atualizações por e-mail com o status (recebido, em análise, correção aplicada ou
            orientação de contorno).
          </p>
        </>
      }
      childrenEn={
        <>
          <h2>How to contact NEXO</h2>
          <p>
            For operational questions, technical issues, security reports, or product feedback, contact{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>
          <p>
            Please include: page URL, approximate timestamp, visible error message, and reproduction steps.
          </p>
          <p>
            Fast channel:{" "}
            <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp {CONTACTS.whatsappDisplay}
            </a>.
          </p>

          <h2>Support hours</h2>
          <p>Monday to Friday, 09:00-18:00 (America/Sao_Paulo), excluding local holidays.</p>

          <h2>First response target</h2>
          <ul>
            <li>Critical (full outage): within 4 business hours.</li>
            <li>High (recurring error with no workaround): within 8 business hours.</li>
            <li>Medium/Low (questions, tweaks, improvements): within 1 business day.</li>
          </ul>

          <h2>Current support scope</h2>
          <ul>
            <li>Free flow for markdown import and PDF generation.</li>
            <li>Waitlist registration and submission confirmation.</li>
            <li>Language, theme, and Home/Pricing navigation issues.</li>
            <li>Clarifications about Free session limitations and privacy.</li>
          </ul>

          <h2>Out of scope</h2>
          <ul>
            <li>Internal document customization for your organization.</li>
            <li>Formal training and dedicated operational consulting.</li>
            <li>Advanced integrations not yet released in authenticated area.</li>
          </ul>

          <h2>Case updates</h2>
          <p>
            You will receive e-mail updates with status changes (received, under analysis, fix deployed, or
            workaround guidance).
          </p>
        </>
      }
    />
  );
}
