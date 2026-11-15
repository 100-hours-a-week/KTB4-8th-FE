"use client";

import { AppBar } from "@/components/ui/AppBar";
import { PRIVACY } from "@/features/legal/content";
import { LegalDocView } from "@/features/legal/LegalDocView";

export default function PrivacyPage() {
  return (
    <>
      <AppBar back title="개인정보 처리방침" />
      <LegalDocView doc={PRIVACY} />
    </>
  );
}
