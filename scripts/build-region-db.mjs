#!/usr/bin/env node
/* 행정표준코드관리시스템의 "법정동 코드 전체자료" txt를 TypeScript 데이터로 변환한다.
   사용법: node scripts/build-region-db.mjs <원본-txt> [출력-ts] */
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3] || "src/lib/address/legalDongData.ts";
if (!input) {
  console.error(
    "사용법: node scripts/build-region-db.mjs <원본-txt> [출력-ts]",
  );
  process.exit(1);
}

const buffer = fs.readFileSync(input);
const utf8 = new TextDecoder("utf-8").decode(buffer);
const text = utf8.includes("법정동코드")
  ? utf8
  : new TextDecoder("euc-kr").decode(buffer);

const rows = text
  .replace(/^\uFEFF/, "")
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split("\t"))
  .filter(([code, fullName, status]) => {
    if (!/^\d{10}$/.test(code || "") || status?.trim() !== "존재") return false;
    const lowestName = fullName.trim().split(/\s+/).at(-1) || "";
    return code.endsWith("00") && /(읍|면|동|\d+가)$/.test(lowestName);
  })
  .map(([code, fullName]) => [code, fullName.trim()]);

const updatedAt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
}).format(new Date());
const generated =
  `/* 자동 생성 파일 — 직접 수정하지 마세요.\n` +
  `   source: https://www.code.go.kr/stdcode/regCodeL.do */\n` +
  `export const LEGAL_DONG_META = ${JSON.stringify({
    source: "행정표준코드관리시스템 법정동 코드 전체자료",
    updatedAt,
    count: rows.length,
  })} as const;\n` +
  `export const LEGAL_DONG_ROWS = ${JSON.stringify(rows)} as const;\n`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, generated, "utf8");
console.log(`${rows.length}개 법정 읍·면·동 → ${output}`);
