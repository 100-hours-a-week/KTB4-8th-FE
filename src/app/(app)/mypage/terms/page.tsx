"use client";

import { AppBar } from "@/components/ui/AppBar";
import { TERMS } from "@/features/legal/content";
import { LegalDocView } from "@/features/legal/LegalDocView";

export default function TermsPage() {
  return (
    <>
      <AppBar back title="이용약관" />
      <LegalDocView doc={TERMS} />
    </>
  );
}
