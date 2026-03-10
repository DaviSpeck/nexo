import LegalTemplate from "@/components/legal-template";
import { CONTACTS, CONTACT_LINKS } from "@/lib/contacts";

export default function PrivacyPage() {
  return (
    <LegalTemplate
      titlePt="Política de Privacidade"
      titleEn="Privacy Policy"
      updatedLabelPt="Atualizado em"
      updatedLabelEn="Updated on"
      updatedDate="10/03/2026"
      childrenPt={
        <>
          <h2>Resumo de privacidade</h2>
          <p>
            A NEXO coleta o mínimo necessário para operar o serviço, manter segurança, entender uso do produto e
            evoluir funcionalidades.
          </p>

          <h2>Quais dados tratamos</h2>
          <ul>
            <li>
              Dados de navegação e telemetria: páginas visitadas, eventos (ex.: page_view, go_to_pricing),
              data/hora e informações técnicas do navegador.
            </li>
            <li>
              Dados de lista de interesse: nome, e-mail corporativo, empresa, cargo/função e contexto opcional
              informado por você.
            </li>
            <li>
              Metadados de execução Free: tamanho de arquivos, quantidade de anexos, tempo de processamento,
              status e mensagens de erro técnicas.
            </li>
          </ul>

          <h2>Modo Free: o que não salvamos</h2>
          <p>
            No modo Free, não persistimos conteúdo integral de markdown, imagens enviadas nem o PDF gerado.
            Esses artefatos são processados apenas para execução da conversão durante a sessão.
          </p>

          <h2>Base legal e finalidade</h2>
          <ul>
            <li>Execução do serviço solicitado por você.</li>
            <li>Legítimo interesse para segurança, estabilidade e melhoria de produto.</li>
            <li>Cumprimento de obrigações legais e prevenção de fraude/abuso.</li>
          </ul>

          <h2>Compartilhamento</h2>
          <p>
            Podemos utilizar fornecedores de infraestrutura e banco de dados para operar a plataforma
            (ex.: hospedagem e persistência), com controles técnicos e contratuais.
            Não vendemos dados pessoais.
          </p>

          <h2>Retenção</h2>
          <p>
            Mantemos dados pelo período necessário para as finalidades desta política, obrigações legais e
            defesa em processos. Após isso, os dados são anonimizados ou excluídos, quando aplicável.
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção, atualização ou exclusão de dados pessoais, conforme legislação
            aplicável (incluindo LGPD). Solicitações:{" "}
            <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>

          <h2>Transferências internacionais</h2>
          <p>
            Dependendo da infraestrutura contratada, dados podem ser processados fora do país de origem, com
            salvaguardas razoáveis de proteção.
          </p>

          <h2>Atualizações desta política</h2>
          <p>
            Esta política pode ser ajustada para refletir mudanças legais, técnicas e de produto.
            A data de atualização indica a versão vigente.
          </p>
        </>
      }
      childrenEn={
        <>
          <h2>Privacy summary</h2>
          <p>
            NEXO collects only what is necessary to run the service, maintain security, understand product usage,
            and improve features.
          </p>

          <h2>What data we process</h2>
          <ul>
            <li>
              Navigation and telemetry data: visited pages, events (e.g. page_view, go_to_pricing),
              timestamps, and browser technical data.
            </li>
            <li>
              Waitlist data: name, work e-mail, company, role/title, and optional context provided by you.
            </li>
            <li>
              Free execution metadata: file sizes, attachment count, processing time,
              status, and technical error messages.
            </li>
          </ul>

          <h2>Free mode: what we do not store</h2>
          <p>
            In Free mode, we do not persist full markdown content, uploaded images, or generated PDFs.
            These artifacts are processed only for conversion execution during the session.
          </p>

          <h2>Legal basis and purpose</h2>
          <ul>
            <li>Execution of the service requested by you.</li>
            <li>Legitimate interest for security, stability, and product improvement.</li>
            <li>Compliance with legal obligations and fraud/abuse prevention.</li>
          </ul>

          <h2>Data sharing</h2>
          <p>
            We may rely on infrastructure and database providers to operate the platform
            (e.g. hosting and persistence), under technical and contractual controls.
            We do not sell personal data.
          </p>

          <h2>Retention</h2>
          <p>
            We retain data for as long as needed to fulfill this policy purposes, legal obligations,
            and legal defense. After that, data may be anonymized or deleted when applicable.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access, correction, update, or deletion of personal data, according to applicable
            laws. Requests: <a href={CONTACT_LINKS.supportMailto}>{CONTACTS.supportEmail}</a>.
          </p>

          <h2>International transfers</h2>
          <p>
            Depending on contracted infrastructure, data may be processed outside your country,
            with reasonable safeguards.
          </p>

          <h2>Policy updates</h2>
          <p>
            This policy may be updated to reflect legal, technical, and product changes.
            The update date indicates the current version.
          </p>
        </>
      }
    />
  );
}
