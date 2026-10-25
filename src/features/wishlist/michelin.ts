import type { Michelin } from "./types";

/* 미쉐린 가이드 서울 2026 선정 목록 — 공식 사이트(guide.michelin.com, 2026-10-26 확인)의 스타 42곳 · 빕 구르망 51곳.
   장소 이름이 이 목록과 같으면 카드 · 상세에 미쉐린 아이콘이 자동으로 붙는다(데이터에 따로 적지 않아도 된다).
   새 장소를 추가할 때 이름만 공식 표기와 같으면 되고, 이름이 달라서 안 붙으면 장소 데이터의 extra.michelin 에 직접 적는다.
   목록이 바뀌는 해(다음 가이드)에는 아래 두 목록과 MICHELIN_EDITION 만 고치면 된다. */

export const MICHELIN_EDITION = "미쉐린 가이드 서울 2026";

/** 스타 레스토랑: 이름 → [스타 개수, 미쉐린 가이드 주소 슬러그] */
const STARS: Record<string, [1 | 2 | 3, string]> = {
  라연: [2, "la-yeon"],
  "라망 시크레": [1, "l-amant-secret"],
  "유 유안": [1, "yu-yuan"],
  기가스: [1, "gigas"],
  "레스토랑 주은": [1, "restaurant-jueun"],
  온지음: [1, "onjium"],
  소울: [1, "soul-dining"],
  모수: [2, "mosu"],
  소수헌: [2, "sosuheon"],
  소설한남: [1, "soseoul-hannam"],
  에스콘디도: [1, "escondido"],
  "제로 컴플렉스": [1, "zero-complex"],
  "레스토랑 산": [1, "san"],
  이스트: [1, "y-east"],
  스와니예: [2, "soigne"],
  레귬: [1, "legume"],
  하쿠시: [1, "hakusi"],
  기와강: [1, "giwakang"],
  "고료리 켄": [1, "goryori-ken"],
  에빗: [2, "evett"],
  정식당: [2, "jungsik511965"],
  윤서울: [1, "yun"],
  라미띠에: [1, "l-amitie"],
  밍글스: [3, "mingles"],
  "강민철 레스토랑": [1, "kang-minchul-restaurant"],
  권숙수: [2, "kwonsooksoo"],
  "스시 마츠모토": [1, "sushi-matsumoto-1195338"],
  뛰뚜아멍: [1, "tutoiement"],
  "가겐 바이 최준호": [1, "gaggen"],
  꼴라쥬: [1, "collage"],
  무니: [1, "muni"],
  빈호: [1, "vinho"],
  "알라 프리마": [2, "alla-prima"],
  미토우: [2, "mitou"],
  솔밤: [1, "solbam"],
  무오키: [1, "muoki"],
  익스퀴진: [1, "exquisine"],
  세븐스도어: [1, "7th-door"],
  "레스토랑 알렌": [2, "restaurant-allen"],
  "이타닉 가든": [1, "eatanic-garden"],
  "스시 카네사카": [1, "sushi-kanesaka-1244365"],
  비채나: [1, "bicena"],
};

/** 빕 구르망: [이름, 슬러그] */
const BIB: [string, string][] = [
  ["우래옥", "woo-lae-oak"],
  ["필동면옥", "pildong-myeonok"],
  ["개성만두 궁", "gaeseong-mandu-koong"],
  ["미진", "mijin"],
  ["소바키리 스즈", "sobakeeri-suzu"],
  ["안암", "anam"],
  ["금돼지식당", "geumdwaeji-sikdang"],
  ["유림면", "yurimmyeon"],
  ["고사리 익스프레스", "gosari-express"],
  ["황생가 칼국수", "hwangsaengga-kalguksu"],
  ["서령", "seoryung"],
  ["할매집", "halmaejip"],
  ["호라파", "horapa"],
  ["용금옥", "yonggeumok"],
  ["안덕", "andeok"],
  ["대성집", "daesungjip"],
  ["유한", "youhan"],
  ["자하 손만두", "jaha-son-mandu"],
  ["알트에이", "alt-a"],
  ["황금콩밭", "hwanggeum-kongbat"],
  ["오일제", "oilje"],
  ["역전회관", "yukjeon-hoekwan"],
  ["능동미나리", "neungdong-minari"],
  ["베이스 이즈 나이스", "base-is-nice"],
  ["계월", "kyewol-gomtang"],
  ["맷돌", "mattdol"],
  ["마포옥", "mapo-ok"],
  ["만두집", "mandujip"],
  ["꿉당", "ggupdang"],
  ["면서울", "myeon-seoul"],
  ["니시무라멘", "nishimuramen"],
  ["사루카메", "sarukame"],
  ["정면", "jeongmyeon"],
  ["게방식당", "gebang-sikdang"],
  ["오레노 라멘", "oreno-ramen"],
  ["담택", "damtaek"],
  ["진진", "jin-jin"],
  ["옥동식", "okdongsik"],
  ["서교난면방", "seokyonanmyunbang"],
  ["미필담", "mipildam"],
  ["교다이야", "kyodaiya"],
  ["정인면옥", "jungin-myeonok"],
  ["합정옥", "hapjeongok"],
  ["양양 메밀 막국수", "yangyang-memil-makguksu"],
  ["화해당", "hwa-hae-dang"],
  ["스바루", "subaru"],
  ["곰탕랩", "gomtang-lab"],
  ["3대 삼계장인", "3rd-samgyetang"],
  ["삼청동 수제비", "samcheongdong-sujebi"],
  ["임병주 산동 칼국수", "limbyungjoo-sandong-kalguksu"],
  ["옥돌현옥", "okdol-heyonok"],
];

/** 비교용 이름 — 공백 · 기호를 없애고, 끝의 "본점"을 뗀다(예: "오레노라멘 본점" = "오레노 라멘") */
function norm(name: string): string {
  return name
    .replace(/[\s·.\-–—()]/g, "")
    .replace(/본점$/, "")
    .toLowerCase();
}

interface Entry {
  michelin: Michelin;
  slug: string;
}

const INDEX = new Map<string, Entry>();
for (const [name, [n, slug]] of Object.entries(STARS))
  INDEX.set(norm(name), { michelin: n, slug });
for (const [name, slug] of BIB)
  INDEX.set(norm(name), { michelin: "bib", slug });

/** 미쉐린 가이드 서울의 레스토랑 상세 페이지 */
const GUIDE_BASE =
  "https://guide.michelin.com/kr/ko/seoul-capital-area/kr-seoul/restaurant";

export interface MichelinInfo {
  michelin: Michelin;
  /** 미쉐린 가이드 서울의 이 레스토랑 페이지 주소(목록에 없는 장소는 없다) */
  url?: string;
}

/** 이름으로 선정 여부와 미쉐린 가이드 페이지 주소를 찾는다 — 이름이 같은 것만(부분 일치는 하지 않는다).
    장소 데이터에 직접 적은 값(extra.michelin)이 있으면 그 등급을 우선하고, 주소는 이름이 목록에 있을 때만 붙는다. */
export function resolveMichelin(
  name: string | null | undefined,
  explicit?: Michelin,
): MichelinInfo | undefined {
  const hit = name ? INDEX.get(norm(name)) : undefined;
  const michelin = explicit ?? hit?.michelin;
  if (!michelin) return undefined;
  return { michelin, url: hit ? `${GUIDE_BASE}/${hit.slug}` : undefined };
}
