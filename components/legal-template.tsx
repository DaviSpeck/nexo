"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useLocale } from "@/components/locale";

type Props = {
  titlePt: string;
  titleEn: string;
  updatedLabelPt: string;
  updatedLabelEn: string;
  updatedDate: string;
  childrenPt: ReactNode;
  childrenEn: ReactNode;
};

export default function LegalTemplate(props: Props) {
  const { locale } = useLocale();
  const isPt = locale === "pt";

  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link href="/" className="legal-back">
          {isPt ? "Voltar para home" : "Back to home"}
        </Link>
        <h1>{isPt ? props.titlePt : props.titleEn}</h1>
        <p className="legal-updated">
          {isPt ? props.updatedLabelPt : props.updatedLabelEn}: {props.updatedDate}
        </p>
        <article className="legal-content">{isPt ? props.childrenPt : props.childrenEn}</article>
      </div>
    </main>
  );
}
