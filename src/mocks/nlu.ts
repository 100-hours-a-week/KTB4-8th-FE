/* 챗봇 조건(슬롯) 추출 모의 구현 — 프로토타입 js/api/nlu.js 포트.
   실제로는 AI 서버가 region / date / timeOfDay / availableMinutes(180·360·540분) / categories 슬롯을 채운다.
   여기서는 키워드 규칙으로 같은 형태의 결과를 만든다. */
import { CATEGORY_LABEL } from "@/lib/constants";
import { addDays, fmtDate, toIso } from "@/lib/format";
import { ambiguousRegions } from "./db";
import type {
  AvailableMinutes,
  Category,
  RecommendationSlots,
  TimeOfDay,
} from "@/types/api";

const CATEGORY_WORDS: Partial<Record<Category, string[]>> = {
  CAFE: ["카페", "커피", "디저트", "베이커리"],
  RESTAURANT: ["맛집", "밥", "식당", "저녁", "점심", "먹"],
  POPUP: ["팝업", "팝업스토어", "편집샵"],
  EXHIBITION: ["전시", "미술관", "갤러리", "박물관"],
};

interface RegionWord {
  key: string;
  /** null 이면 여러 지역에 걸쳐 있어 되물어야 하는 키워드다 */
  label: string | null;
}

const REGION_WORDS: RegionWord[] = [
  { key: "성수", label: "성동구 성수동" },
  { key: "성동", label: "서울 성동구" },
  { key: "강남", label: "강남구 역삼동" },
  { key: "을지로", label: "중구 을지로" },
  { key: "종로", label: "종로구 통의동" },
  { key: "연남", label: "마포구 연남동" },
  { key: "홍대", label: "마포구 서교동" },
  { key: "중구", label: null },
];

const DOW_INDEX: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
};

function nextDow(base: Date, dow: number): Date {
  const d = new Date(base);
  const diff = (dow - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

/** 몇 시간을 말했든 AI 명세의 3단계(180/360/540분)로 반올림한다 */
function toAvailableMinutes(hours: number): AvailableMinutes {
  if (hours <= 4) return 180;
  if (hours <= 7) return 360;
  return 540;
}

export interface ExtractResult {
  slots: RecommendationSlots;
  /** 여러 지역에 걸친 키워드를 말했을 때만 채워진다(예: "중구") */
  ambiguous: string | null;
}

export function extract(
  text: string,
  prev: RecommendationSlots,
): ExtractResult {
  const slots: RecommendationSlots = { ...prev };
  let ambiguous: string | null = null;

  /* 지역 */
  for (const r of REGION_WORDS) {
    if (text.indexOf(r.key) >= 0) {
      if (r.label) slots.region = r.label;
      else ambiguous = r.key;
      break;
    }
  }

  /* 날짜 */
  const today = new Date();
  if (text.indexOf("오늘") >= 0) {
    slots.date = toIso(today).slice(0, 10);
  } else if (text.indexOf("내일") >= 0) {
    slots.date = toIso(addDays(today, 1)).slice(0, 10);
  } else if (text.indexOf("주말") >= 0) {
    slots.date = toIso(nextDow(today, 6)).slice(0, 10);
  } else {
    const m = text.match(/([일월화수목금토])요일/);
    if (m) slots.date = toIso(nextDow(today, DOW_INDEX[m[1]])).slice(0, 10);
  }

  /* 시간대 */
  if (text.indexOf("오전") >= 0 || text.indexOf("아침") >= 0) {
    slots.timeOfDay = "MORNING" as TimeOfDay;
  } else if (text.indexOf("저녁") >= 0 || text.indexOf("밤") >= 0) {
    slots.timeOfDay = "EVENING" as TimeOfDay;
  } else if (text.indexOf("오후") >= 0 || text.indexOf("점심") >= 0) {
    slots.timeOfDay = "AFTERNOON" as TimeOfDay;
  }

  /* 외출 가능 시간 */
  const hm = text.match(/(\d+)\s*시간/);
  if (hm) slots.availableMinutes = toAvailableMinutes(parseInt(hm[1], 10));
  else if (text.indexOf("반나절") >= 0) slots.availableMinutes = 360;
  else if (text.indexOf("하루") >= 0) slots.availableMinutes = 540;

  /* 카테고리 */
  const cats = slots.categories ? [...slots.categories] : [];
  (Object.keys(CATEGORY_WORDS) as Category[]).forEach((key) => {
    if (cats.indexOf(key) >= 0) return;
    const words = CATEGORY_WORDS[key] ?? [];
    if (words.some((w) => text.indexOf(w) >= 0)) cats.push(key);
  });
  if (cats.length) slots.categories = cats;

  return { slots, ambiguous };
}

interface SlotLabels {
  region: string;
  date: string;
  timeOfDay: string;
  availableMinutes: string;
  categories: string;
}

const TIME_OF_DAY_KOR: Record<TimeOfDay, string> = {
  MORNING: "오전",
  AFTERNOON: "오후",
  EVENING: "저녁",
};

function label(slots: RecommendationSlots): SlotLabels {
  return {
    region: slots.region || "",
    date: slots.date ? fmtDate(new Date(`${slots.date}T00:00:00+09:00`)) : "",
    timeOfDay: slots.timeOfDay ? TIME_OF_DAY_KOR[slots.timeOfDay] : "",
    availableMinutes: slots.availableMinutes
      ? `${slots.availableMinutes / 60}시간`
      : "",
    categories: (slots.categories ?? [])
      .map((c) => CATEGORY_LABEL[c])
      .join(", "),
  };
}

/** 다음에 물어볼 조건 — 지역·날짜/시간이 필수, 외출 시간·카테고리가 선택 */
export function missingRequired(
  slots: RecommendationSlots,
): "region" | "datetime" | null {
  if (!slots.region) return "region";
  if (!slots.date || !slots.timeOfDay) return "datetime";
  return null;
}

export interface AnalyzeResult {
  reply: string;
  slots: RecommendationSlots;
  /** 명세의 ChatReply.options 는 문자열 배열이라, 지역 되묻기 후보도 라벨 문자열로 낸다 */
  options?: string[];
}

export function analyze(
  text: string,
  prev: RecommendationSlots,
): AnalyzeResult {
  const { slots, ambiguous } = extract(text, prev);
  const l = label(slots);

  if (ambiguous) {
    return {
      reply: `${ambiguous}가 여러 곳이에요.\n어디를 말씀하시나요?`,
      slots,
      options: ambiguousRegions[ambiguous] ?? [],
    };
  }

  const missing = missingRequired(slots);
  if (missing === "region") {
    return {
      reply:
        "어느 지역에서 만나실 건가요?\n동네 이름까지 알려주시면 더 정확해요.",
      slots,
    };
  }
  if (missing === "datetime") {
    return {
      reply: `${l.region}으로 볼게요.\n언제 가실 예정이세요? (예: 이번 주 토요일 오후)`,
      slots,
    };
  }

  let reply = `지금 계신 ${l.region} 기준으로 ${l.date} ${l.timeOfDay}에 맞출게요.`;
  if (!slots.availableMinutes) reply += "\n얼마나 돌아다닐 수 있으세요?";
  else if (!slots.categories)
    reply += "\n어떤 곳을 보고 싶으세요? (카페·맛집·팝업·전시)";
  else reply += "\n조건이 모두 모였어요. 아래 버튼으로 추천을 받아보세요.";

  return { reply, slots };
}
