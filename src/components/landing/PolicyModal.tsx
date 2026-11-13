"use client";

import React, { useEffect } from "react";
import {
  LEGAL_REVISED,
  LEGAL_VERSION,
  PRIVACY,
  TERMS,
} from "@/features/legal/content";

export type PolicyType = "privacy" | "terms";

interface PolicyModalProps {
  type: PolicyType | null;
  onClose: () => void;
}

const H3 = "font-bold text-base text-gray-900 dark:text-white mb-2";
const UL = "list-disc pl-5 space-y-1 text-xs";
/* 본문 안 링크 · 강조 — 내용 쪽에는 클래스를 붙이지 않으므로 여기서 한꺼번에 입힌다 */
const LINKS =
  "[&_a]:underline [&_a]:text-[#16a46b] [&_a]:font-medium [&_a:hover]:text-[#0e8a58] [&_strong]:text-gray-900 dark:[&_strong]:text-white";

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (type) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  const doc = type === "privacy" ? PRIVACY : TERMS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#1a1f1c] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden text-[#17161b] dark:text-[#f4f3f6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 id="policy-title" className="text-lg font-bold text-[#16a46b]">
              {doc.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              최종 개정일: {LEGAL_REVISED} · 버전 {LEGAL_VERSION}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 본문 스크롤 영역 — 내용은 src/features/legal/content.tsx 한 곳에서 관리한다 */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${LINKS}`}
        >
          {doc.notice && (
            <div className="p-4 rounded-xl bg-[#effaf4] dark:bg-[#142e22] border border-[#16a46b]/20 text-xs">
              <p className="font-semibold text-[#0a5236] dark:text-[#74d3a9] mb-1">
                {doc.notice.title}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {doc.notice.text}
              </p>
            </div>
          )}
          {doc.intro && <p className="text-xs">{doc.intro}</p>}

          {doc.sections.map((section) => (
            <section key={section.title}>
              <h3 className={H3}>{section.title}</h3>
              {section.blocks.map((block, i) => {
                if (block.kind === "ul")
                  return (
                    <ul className={`${UL} ${i > 0 ? "mt-2" : ""}`} key={i}>
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                if (block.kind === "sub")
                  return (
                    <p
                      className="text-xs font-semibold text-gray-900 dark:text-white mt-3 mb-1"
                      key={i}
                    >
                      {block.text}
                    </p>
                  );
                return (
                  <p className={`text-xs ${i > 0 ? "mt-2" : ""}`} key={i}>
                    {block.text}
                  </p>
                );
              })}
            </section>
          ))}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#151916] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#16a46b] hover:bg-[#0e8a58] text-white font-medium text-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
