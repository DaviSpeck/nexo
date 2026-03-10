import LegalTemplate from "@/components/legal-template";
import { CONTACTS, CONTACT_LINKS } from "@/lib/contacts";

export default function TermsPage() {
  return (
    <LegalTemplate
      titlePt="Termos de Uso"
      titleEn="Terms of Use"
      updatedLabelPt="Atualizado em"
      updatedLabelEn="Updated on"
      updatedDate="10/03/2026"
      childrenPt={
        <>
          <h2>Aceitação e objetivo</h2>
          <p>
            Ao acessar a NEXO, você concorda com estes Termos de Uso. A plataforma foi criada para transformar
            conteúdo em markdown em documentos PDF com padrão de comunicação institucional.
          </p>

          <h2>Elegibilidade e uso permitido</h2>
          <p>
            Você declara que possui autorização para utilizar os conteúdos enviados e que o uso da plataforma
            respeita legislação aplicável e políticas internas da sua instituição.
          </p>
          <ul>
            <li>É proibido enviar conteúdo ilícito, malicioso ou que viole direitos de terceiros.</li>
            <li>É proibido tentar burlar limites técnicos, automações de proteção ou controles de acesso.</li>
            <li>Você responde pelo conteúdo inserido e pelas decisões tomadas com base nos resultados.</li>
          </ul>

          <h2>Modo Free e limitações atuais</h2>
          <p>
            O modo Free é disponibilizado para validação de fluxo. Nesta etapa, a NEXO pode ajustar
            funcionalidades, limites e experiência sem comunicação prévia.
          </p>
          <ul>
            <li>Não há SLA contratual de disponibilidade para o modo Free.</li>
            <li>Recursos premium e área autenticada podem estar indisponíveis ou em evolução.</li>
            <li>A lista de interesse não garante data específica de liberação comercial.</li>
          </ul>

          <h2>Propriedade intelectual</h2>
          <p>
            O software, marca, layout e materiais da NEXO pertencem à SPECK TECH SOLUTIONS LTDA.
            O usuário mantém titularidade sobre seus próprios conteúdos.
          </p>

          <h2>Isenções e responsabilidade</h2>
          <p>
            A NEXO é fornecida no estado atual, com melhorias contínuas. Não garantimos que o serviço será
            ininterrupto ou livre de falhas em todos os contextos.
          </p>
          <p>
            Em qualquer cenário, você deve revisar o documento final antes de uso institucional, publicação
            ou tomada de decisão crítica.
          </p>

          <h2>Suspensão e encerramento</h2>
          <p>
            Podemos limitar ou interromper acesso em caso de abuso, uso indevido, risco de segurança ou
            descumprimento destes termos.
          </p>

          <h2>Alterações destes termos</h2>
          <p>
            Estes termos podem ser atualizados para refletir evolução do produto, requisitos legais ou mudanças
            operacionais. A versão mais recente será publicada nesta página.
          </p>

          <h2>Contato</h2>
          <p>
            Dúvidas jurídicas ou operacionais sobre estes termos:{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>
        </>
      }
      childrenEn={
        <>
          <h2>Acceptance and purpose</h2>
          <p>
            By accessing NEXO, you agree to these Terms of Use. The platform is designed to transform markdown
            content into PDF documents with an institutional communication standard.
          </p>

          <h2>Eligibility and permitted use</h2>
          <p>
            You represent that you are authorized to use submitted content and that your platform usage complies
            with applicable law and your institution policies.
          </p>
          <ul>
            <li>You must not submit illegal, malicious, or third-party rights-violating content.</li>
            <li>You must not bypass technical limits, protection automations, or access controls.</li>
            <li>You are responsible for submitted content and decisions based on generated output.</li>
          </ul>

          <h2>Free mode and current limitations</h2>
          <p>
            Free mode is provided for flow validation. At this stage, NEXO may change features, limits, and UX
            without prior notice.
          </p>
          <ul>
            <li>There is no contractual availability SLA for Free mode.</li>
            <li>Premium features and authenticated area may be unavailable or under development.</li>
            <li>Joining the waitlist does not guarantee a specific commercial launch date.</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>
            Software, brand, layout, and NEXO materials belong to SPECK TECH SOLUTIONS LTDA.
            Users retain ownership of their own content.
          </p>

          <h2>Disclaimers and liability</h2>
          <p>
            NEXO is provided as-is with continuous improvements. We do not guarantee uninterrupted operation
            or zero-failure behavior in every context.
          </p>
          <p>
            You must review final documents before institutional use, publication, or critical decision-making.
          </p>

          <h2>Suspension and termination</h2>
          <p>
            We may restrict or terminate access in cases of abuse, misuse, security risk, or non-compliance
            with these terms.
          </p>

          <h2>Updates to these terms</h2>
          <p>
            These terms may be updated to reflect product evolution, legal requirements, or operational changes.
            The latest version will always be available on this page.
          </p>

          <h2>Contact</h2>
          <p>
            Legal or operational questions about these terms:{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>
        </>
      }
    />
  );
}
