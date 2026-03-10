import LegalTemplate from "@/components/legal-template";
import { CONTACTS, CONTACT_LINKS } from "@/lib/contacts";

export default function SecurityPage() {
  return (
    <LegalTemplate
      titlePt="Segurança"
      titleEn="Security"
      updatedLabelPt="Atualizado em"
      updatedLabelEn="Updated on"
      updatedDate="10/03/2026"
      childrenPt={
        <>
          <h2>Postura de segurança</h2>
          <p>
            Segurança na NEXO é tratada como processo contínuo: prevenção, detecção, resposta e melhoria.
            Mantemos controles técnicos proporcionais ao estágio atual do produto.
          </p>

          <h2>Controles aplicados</h2>
          <ul>
            <li>Validação de payload e limites de entrada para reduzir abuso e falhas de processamento.</li>
            <li>Separação entre chaves públicas e chaves de servidor.</li>
            <li>Persistência restrita a metadados operacionais no modo Free.</li>
            <li>Registro de eventos operacionais para auditoria técnica e investigação de incidentes.</li>
            <li>Revisão contínua de fluxos críticos de API (conversão, waitlist e tracking).</li>
          </ul>

          <h2>Responsabilidade compartilhada</h2>
          <p>
            A NEXO protege a infraestrutura e o processamento da aplicação. Você é responsável por controlar
            acesso interno, origem do conteúdo enviado e revisão do documento final antes de uso institucional.
          </p>

          <h2>Sessão Free</h2>
          <p>
            O conteúdo integral de markdown, anexos e PDF não é armazenado permanentemente no modo Free.
            A execução registra apenas metadados técnicos necessários para operação e estabilidade.
          </p>

          <h2>Reporte de vulnerabilidade</h2>
          <p>
            Para reportar vulnerabilidades, envie:
          </p>
          <ul>
            <li>Descrição do risco e impacto observado.</li>
            <li>Passo a passo de reprodução.</li>
            <li>Evidências técnicas (logs, prints ou payloads mascarados).</li>
          </ul>
          <p>
            Canal oficial:{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>

          <h2>Resposta a incidentes</h2>
          <p>
            Priorizamos contenção, análise de causa raiz, correção e comunicação de status para casos com
            impacto real de disponibilidade, integridade ou confidencialidade.
          </p>
        </>
      }
      childrenEn={
        <>
          <h2>Security posture</h2>
          <p>
            Security at NEXO is treated as a continuous process: prevention, detection, response, and
            improvement. We keep controls proportional to the current product stage.
          </p>

          <h2>Implemented controls</h2>
          <ul>
            <li>Payload validation and input limits to reduce abuse and processing failures.</li>
            <li>Separation between public keys and server-only keys.</li>
            <li>Restricted persistence to operational metadata in Free mode.</li>
            <li>Operational event logging for technical audit and incident investigation.</li>
            <li>Ongoing review of critical API flows (conversion, waitlist, and tracking).</li>
          </ul>

          <h2>Shared responsibility</h2>
          <p>
            NEXO secures infrastructure and application processing. You are responsible for internal access
            control, source of submitted content, and final document review before institutional use.
          </p>

          <h2>Free session</h2>
          <p>
            Full markdown content, attachments, and generated PDF are not permanently stored in Free mode.
            Execution records only technical metadata required for operations and stability.
          </p>

          <h2>Vulnerability reporting</h2>
          <p>
            To report vulnerabilities, include:
          </p>
          <ul>
            <li>Risk description and observed impact.</li>
            <li>Step-by-step reproduction details.</li>
            <li>Technical evidence (logs, screenshots, or masked payloads).</li>
          </ul>
          <p>
            Official channel:{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>

          <h2>Incident response</h2>
          <p>
            We prioritize containment, root cause analysis, remediation, and status communication for incidents
            affecting availability, integrity, or confidentiality.
          </p>
        </>
      }
    />
  );
}
