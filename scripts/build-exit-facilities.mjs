/* KRIC(철도산업정보센터) "역사별 출구정보"(stationGateInfo)를 한 번에 받아 출구 주변 시설 표를 만든다.

   결과: src/lib/address/exitFacilitiesData.json  —  { "왕십리역": { "4": ["성동경찰서", ...] } }

   KRIC 운영기관이 "열차시각표 외에는 갱신 주기가 분기·반기이고, 1일 1회 GET 또는 배치 작업으로 받아 달라,
   과도한 GET 은 불이익"이라고 안내했다. 그래서 이 스크립트는
     - 기본이 시험 실행(dry-run)이라 --yes 를 붙이기 전에는 KRIC 를 부르지 않고,
     - 역·노선마다 한 번씩만, 요청 사이에 간격을 두어 천천히 부르고(기본 2초),
     - 진행 상황을 ~/.keepgo-dev/exit-facilities-progress.json 에 남겨 멈춰도 이어서 받으며(중복 호출 없음),
     - 오류가 연달아 나면 바로 멈춘다.
   분기에 한 번 정도만 돌리면 된다. 다시 돌릴 땐 먼저 KRIC 담당자에게 알리는 것이 좋다.

   사용:
     node scripts/build-exit-facilities.mjs                       # 시험 실행: 호출 수와 예상 시간만 보여 준다
     node scripts/build-exit-facilities.mjs --yes                 # 실제로 받는다
     node scripts/build-exit-facilities.mjs --yes --limit 20      # 앞의 20곳만(시험용)
   옵션:
     --codes <xlsx>        역 코드표(기본: ~/Downloads 의 "운영기관_역사_코드정보*.xlsx")
     --operators S1,S9,...   받을 운영기관 코드(기본: 수도권 도시철도)
     --delay <ms>          요청 간격(기본 2000)
     --fresh               진행 파일을 무시하고 처음부터

   키: .env.local 의 KRIC_SERVICE_KEY.  출처 표시가 필요한 데이터다(마이페이지의 데이터 출처 안내). */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const OUT = path.join(root, "src/lib/address/exitFacilitiesData.json");
const PROGRESS = path.join(
  os.homedir(),
  ".keepgo-dev",
  "exit-facilities-progress.json",
);
const ENDPOINT =
  "https://openapi.kric.go.kr/openapi/convenientInfo/stationGateInfo";

/* 수도권 도시철도 운영기관 코드(코드표의 RAIL_OPR_ISTT_CD). 한국철도공사(KR)는 지방 노선도 있어서
   노선 코드로 한 번 더 거른다. 실제 목록은 시험 실행에서 확인한 뒤 --operators 로 조정한다. */
const DEFAULT_OPERATORS = [
  "S1",
  "S9",
  "AR",
  "GX",
  "IC",
  "DX",
  "GM",
  "UI",
  "UL",
  "EV",
  "NU",
  "KR",
  "SH",
  "GU",
  // 수도권인데 처음에 빠뜨렸던 곳: 신림선(SL) · 서해선 일부(SW) · 인천공항공사(IA) · SR(SR)
  "SL",
  "SW",
  "IA",
  "SR",
  // 지방 도시철도: 부산(BS · BG 부산김해경전철) · 대구(DG) · 대전(DJ) · 광주(GJ)
  "BS",
  "BG",
  "DG",
  "DJ",
  "GJ",
];
// 코드표로 확인한 한국철도공사 노선: 1·3·4호선(경인·경부·일산·과천·안산선), 수인분당(K1), 경춘(K2), 경의중앙(K4),
// 경강(K5), 서해선(WS)은 수도권, 동해선(K6, 부산·울산)과 대경선(K7, 대구)은 지방이다. 모두 받는다.
const KR_METRO_LINES = new Set([
  "1",
  "3",
  "4",
  "K1",
  "K2",
  "K4",
  "K5",
  "K6",
  "K7",
  "WS",
]);
/* 같은 이름의 역이 다른 지역에도 있다("시청", "중앙" 등). 이름이 둘 이상의 지역에 걸치면 표에 "시청역@대전"처럼
   지역을 붙여 따로 담고, 찾을 때(exitFacilities.ts)는 카카오가 준 역 주소의 시·도로 지역을 정해 고른다. */
const REGION_BY_OPERATOR = {
  BS: "부산·울산",
  BG: "부산·울산",
  DG: "대구",
  DJ: "대전",
  GJ: "광주",
};
const REGION_BY_KR_LINE = { K6: "부산·울산", K7: "대구" };
const regionOf = (opr, ln) =>
  (opr === "KR" ? REGION_BY_KR_LINE[ln] : REGION_BY_OPERATOR[opr]) ?? "수도권";

/* ── 인자 ── */
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const yes = args.includes("--yes");
// --sample N : 운영기관·노선마다 N곳씩만 받아서 코드와 결과가 맞는지 확인한다(표 파일은 건드리지 않는다)
const sample = Number(opt("--sample", 0));
const fresh = args.includes("--fresh");
const delay = Number(opt("--delay", 2000));
const limit = Number(opt("--limit", Infinity));
const operators = new Set(
  opt("--operators", DEFAULT_OPERATORS.join(",")).split(","),
);
const env = fs.existsSync(path.join(root, ".env.local"))
  ? fs.readFileSync(path.join(root, ".env.local"), "utf8")
  : "";
const KEY =
  process.env.KRIC_SERVICE_KEY ??
  (env.match(/^KRIC_SERVICE_KEY=(.*)$/m) || [])[1]?.trim();

/* ── xlsx 읽기(외부 패키지 없이: zip + XML) ── */
function readZipEntries(buf) {
  // 중앙 디렉터리를 읽어 파일 이름 → 내용을 만든다
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const elen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nlen);
    const dataStart =
      lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    const raw = buf.subarray(dataStart, dataStart + csize);
    files.set(name, method === 0 ? raw : zlib.inflateRawSync(raw));
    p += 46 + nlen + elen + clen;
  }
  return files;
}
const unxml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
function readStationCodes(file) {
  const files = readZipEntries(fs.readFileSync(file));
  const shared = [];
  const sst = files.get("xl/sharedStrings.xml")?.toString("utf8") ?? "";
  for (const si of sst.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    shared.push(
      unxml(
        [...si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
          .map((m) => m[1])
          .join(""),
      ),
    );
  }
  const sheet = files.get("xl/worksheets/sheet1.xml").toString("utf8");
  const rows = [];
  for (const r of sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = {};
    for (const c of r[1].matchAll(
      /<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const t = /t="s"/.test(c[2]);
      const v = c[3]?.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      row[c[1]] = v === undefined ? "" : t ? shared[Number(v)] : unxml(v);
    }
    rows.push(row);
  }
  // 첫 줄은 머리글: A 운영기관코드 B 운영기관명 C 노선코드 D 노선명 E 역코드 F 역명
  return rows
    .slice(1)
    .map((r) => ({
      opr: r.A,
      oprName: r.B,
      ln: r.C,
      lnName: r.D,
      stin: r.E,
      name: r.F,
    }))
    .filter((r) => r.opr && r.stin);
}

function findCodesFile() {
  const arg = opt("--codes", "");
  if (arg) return path.resolve(arg.replace(/^~/, os.homedir()));
  const dir = path.join(os.homedir(), "Downloads");
  const hit = fs
    .readdirSync(dir)
    .find(
      (n) =>
        n.normalize("NFC").startsWith("운영기관_역사_코드정보") &&
        n.endsWith(".xlsx"),
    );
  if (!hit)
    throw new Error(
      "역 코드표(xlsx)를 찾지 못했습니다. --codes 로 경로를 알려 주세요.",
    );
  return path.join(dir, hit);
}

/* "왕십리" → "왕십리역", "잠실(송파구청)" → "잠실역" (카카오의 역 이름과 맞춘다) */
function stationKey(name) {
  const base = name.replace(/\(.*?\)/g, "").trim();
  return base.endsWith("역") ? base : `${base}역`;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── 대상 목록 ── */
const codes = readStationCodes(findCodesFile());
const targets = codes.filter(
  (r) => operators.has(r.opr) && (r.opr !== "KR" || KR_METRO_LINES.has(r.ln)),
);
const byOpr = new Map();
for (const t of targets)
  byOpr.set(
    `${t.opr} ${t.oprName}`,
    (byOpr.get(`${t.opr} ${t.oprName}`) ?? 0) + 1,
  );

console.log(
  `역 코드표: 전체 ${codes.length}행 → 받을 대상 ${targets.length}곳 (운영기관 ${operators.size}개 지정)`,
);
for (const [k, n] of [...byOpr].sort())
  console.log(`  ${k.padEnd(28)} ${String(n).padStart(4)}곳`);
// 한국철도공사 노선을 모두 보여 줘서 수도권 노선 거르기가 맞는지 눈으로 확인할 수 있게 한다
const krLines = new Map();
for (const r of codes.filter((c) => c.opr === "KR")) {
  const k = `${r.ln} ${r.lnName}`;
  const v = krLines.get(k) ?? { n: 0, included: KR_METRO_LINES.has(r.ln) };
  v.n++;
  krLines.set(k, v);
}
console.log("\n한국철도공사(KR) 노선별 역 수  (포함 = 받음, 제외 = 안 받음)");
for (const [k, v] of [...krLines].sort())
  console.log(
    `  ${v.included ? "포함" : "제외"}  ${k.padEnd(18)} ${String(v.n).padStart(3)}곳`,
  );

let list = targets;
if (sample > 0) {
  const seen = new Map();
  list = targets.filter((t) => {
    const k = `${t.opr}|${t.ln}`;
    const n = seen.get(k) ?? 0;
    seen.set(k, n + 1);
    return n < sample;
  });
}
const planned = Number.isFinite(limit)
  ? Math.min(limit, list.length)
  : list.length;
console.log(
  `\n호출 횟수 ${planned}번, 간격 ${delay}ms → 약 ${Math.ceil((planned * delay) / 60000)}분`,
);
if (!yes) {
  console.log(
    "\n시험 실행입니다. KRIC 를 호출하지 않았습니다. 실제로 받으려면 --yes 를 붙이세요.",
  );
  process.exit(0);
}
if (!KEY) {
  console.error(".env.local 에 KRIC_SERVICE_KEY 가 없습니다.");
  process.exit(1);
}

/* ── 받기 ── */
fs.mkdirSync(path.dirname(PROGRESS), { recursive: true });
const progress =
  !fresh && fs.existsSync(PROGRESS)
    ? JSON.parse(fs.readFileSync(PROGRESS, "utf8"))
    : {};
let failures = 0;
let calls = 0;
const run = list.slice(0, planned);
for (let i = 0; i < run.length; i++) {
  const t = run[i];
  const id = `${t.opr}|${t.ln}|${t.stin}`;
  if (progress[id]) continue; // 이미 받은 곳은 다시 부르지 않는다
  const q = new URLSearchParams({
    serviceKey: KEY,
    format: "json",
    railOprIsttCd: t.opr,
    lnCd: t.ln,
    stinCd: t.stin,
  });
  try {
    const res = await fetch(`${ENDPOINT}?${q}`);
    calls++;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const code = json.header?.resultCode;
    if (code !== "00" && code !== "03")
      throw new Error(`resultCode ${code} ${json.header?.resultMsg}`); // 03 = 데이터 없음(정상)
    progress[id] = {
      name: t.name,
      body: (json.body ?? []).map((b) => [
        String(b.exitNo),
        String(b.impFaclNm ?? "").trim(),
      ]),
    };
    failures = 0;
  } catch (err) {
    failures++;
    console.error(
      `\n실패 ${t.name} (${t.oprName} ${t.lnName}): ${err.message}`,
    );
    if (failures >= 3) {
      console.error(
        "연속 3번 실패해서 멈춥니다. 진행 상황은 저장했으니 잠시 뒤 다시 실행하면 이어서 받습니다.",
      );
      fs.writeFileSync(PROGRESS, JSON.stringify(progress));
      process.exit(1);
    }
  }
  if (calls % 20 === 0) fs.writeFileSync(PROGRESS, JSON.stringify(progress));
  process.stdout.write(`\r${i + 1}/${run.length} ${t.name}${" ".repeat(10)}`);
  await sleep(delay);
}
fs.writeFileSync(PROGRESS, JSON.stringify(progress));
process.stdout.write("\n");

/* 표본·제한 실행은 결과만 확인하고 표 파일은 덮어쓰지 않는다(전체를 받을 때만 만든다) */
if (sample > 0 || Number.isFinite(limit)) {
  console.log("\n표본 결과 (표 파일은 바꾸지 않았습니다)");
  for (const t of run) {
    const r = progress[`${t.opr}|${t.ln}|${t.stin}`];
    const exits = new Set((r?.body ?? []).map(([e]) => e));
    const first = (r?.body ?? [])[0];
    console.log(
      `  ${t.oprName.slice(0, 6).padEnd(7)} ${t.lnName.padEnd(10)} ${t.name.padEnd(12)} 출구 ${String(exits.size).padStart(2)}개${first ? `  예) ${first[0]}번 ${first[1]}` : "  (데이터 없음)"}`,
    );
  }
  console.log(`\n이번 실행의 호출 ${calls}번`);
  process.exit(0);
}

/* ── 표 만들기: 역 이름 → 출구 번호 → 시설들(노선이 달라도 같은 역·같은 번호면 합친다) ── */
const table = {};
const regionsByKey = new Map();
for (const [id, { name }] of Object.entries(progress)) {
  const [opr, ln] = id.split("|");
  const key = stationKey(name);
  const set = regionsByKey.get(key) ?? new Set();
  set.add(regionOf(opr, ln));
  regionsByKey.set(key, set);
}
const ambiguous = new Set(
  [...regionsByKey].filter(([, set]) => set.size > 1).map(([key]) => key),
);
for (const [id, { name, body }] of Object.entries(progress)) {
  const [opr, ln] = id.split("|");
  const base = stationKey(name);
  const key = ambiguous.has(base) ? `${base}@${regionOf(opr, ln)}` : base;
  for (const [exitNo, fac] of body) {
    if (!exitNo || !fac) continue;
    // 시설이 아닌 값은 뺀다: 방향 안내("양재방향", "검단산업단지 방면")와 역 이름 그대로("서울역")
    if (
      /(방향|방면)$/.test(fac) ||
      fac === base ||
      fac === base.replace(/역$/, "")
    )
      continue;
    const exits = (table[key] ??= {});
    const arr = (exits[exitNo] ??= []);
    if (!arr.includes(fac)) arr.push(fac);
  }
}
const sorted = Object.fromEntries(
  Object.keys(table)
    .sort((a, b) => a.localeCompare(b, "ko"))
    .map((k) => [
      k,
      Object.fromEntries(
        Object.keys(table[k])
          .sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b))
          .map((e) => [e, table[k][e]]),
      ),
    ]),
);
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
const exits = Object.values(sorted).reduce(
  (n, e) => n + Object.keys(e).length,
  0,
);
if (ambiguous.size)
  console.log(
    `\n여러 지역에 같은 이름이 있어 "역@지역" 키로 나눈 역 ${ambiguous.size}곳: ${[...ambiguous].join(", ")}`,
  );
console.log(
  `저장: ${OUT}\n역 ${Object.keys(sorted).length}곳, 출구 ${exits}개 (이번 실행의 호출 ${calls}번)`,
);
