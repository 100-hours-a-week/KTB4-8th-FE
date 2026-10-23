/* 보관함 목록 아이콘에 올릴 항목별 이모지를 제목 · 설명 키워드로 고른다.
   BE(AI 분석)가 항목마다 emoji 를 내려주기 전까지 쓰는 임시 규칙이고, BE 값이 생기면 그 값이 우선한다.
   우선순위: 항목에 직접 정해 둔 이모지 → 제목 키워드 → 설명 키워드 → (없으면 null: 분류 이모지로 대체).
   기기마다 지원하는 이모지 범위가 달라 Emoji 12(2019) 이전 것만 쓴다. */

interface Rule {
  emoji: string;
  words: string[];
  /** 단어로는 거르기 어려운 것(예: "기록"의 '록'에 걸리지 않게 앞이 한글이 아닐 때만) */
  patterns?: RegExp[];
  /** 범용 단어(축제 · 페스티벌 …)는 설명에서는 찾지 않는다 — 설명에는 아무 말이나 들어 있다 */
  generic?: boolean;
}

/* 위에 있을수록 먼저 맞는다 — 구체적인 것을 앞에, 범용 단어를 뒤에 둔다. */
const RULES: Rule[] = [
  { emoji: "🎆", words: ["불꽃", "폭죽", "fireworks"] },
  { emoji: "🍙", words: ["김밥", "주먹밥", "삼각김밥"] },
  { emoji: "🍗", words: ["치킨", "통닭", "닭강정"] },
  { emoji: "🏃", words: ["마라톤", "러닝", "달리기", "런닝", "marathon"] },
  {
    emoji: "🏎️",
    words: [
      "레이스",
      "레이싱",
      "모터스포츠",
      "서킷",
      "스피드웨이",
      "f1",
      "race",
    ],
  },
  { emoji: "⚾", words: ["야구", "baseball"] },
  { emoji: "⚽", words: ["축구", "풋살", "soccer"] },
  { emoji: "🏀", words: ["농구", "basketball"] },
  { emoji: "🏐", words: ["배구"] },
  { emoji: "🎾", words: ["테니스", "tennis"] },
  { emoji: "⛳", words: ["골프", "golf"] },
  { emoji: "🏊", words: ["수영", "swim"] },
  { emoji: "🎿", words: ["스키", "스노보드"] },
  { emoji: "🚴", words: ["자전거", "사이클", "라이딩", "cycling"] },
  { emoji: "🥾", words: ["등산", "트레킹", "하이킹"] },
  { emoji: "🧘", words: ["요가", "명상", "필라테스", "yoga"] },
  { emoji: "🏅", words: ["운동회", "체육대회", "올림픽"] },
  { emoji: "🎮", words: ["게임", "e스포츠", "esports"] },
  {
    emoji: "🤖",
    words: ["로봇", "모빌리티", "기술", "테크", "ai", "kes", "tech"],
  },
  { emoji: "🎭", words: ["연극", "뮤지컬", "오페라", "발레", "musical"] },
  { emoji: "🎬", words: ["영화", "시네마", "cinema"] },
  { emoji: "📷", words: ["사진전", "포토"] },
  { emoji: "🎨", words: ["미디어아트", "미디어 아트", "드로잉", "일러스트"] },
  { emoji: "🖼️", words: ["전시", "갤러리", "미술", "아트페어", "기획전"] },
  {
    emoji: "🎸",
    words: ["rock"],
    // "록의 함성" · "록페스티벌"은 맞고 "기록" · "목록"은 맞지 않게, 록 앞이 한글이 아닐 때만
    patterns: [/(^|[^가-힣])록/],
  },
  { emoji: "🎤", words: ["콘서트", "공연", "버스킹", "concert"] },
  {
    emoji: "🎶",
    words: ["뮤직", "음악", "재즈", "라이브", "밴드", "lp바", "jazz", "music"],
  },
  /* 술 — 구체적인 것부터: 사케 · 이자카야 → 칵테일 → 와인 → 맥주. "맥주나 와인을 곁들이기 좋은"처럼 여러 개가 같이 나오면 앞의 것이 이긴다.
     조명 · 야경 같은 일반 단어 규칙보다 앞에 둬서, 야외 조명이 있는 칵테일 바가 🌃 로 나오지 않게 한다. */
  {
    emoji: "🍶",
    words: ["이자카야", "니혼슈", "일본주", "izakaya"],
    // "사케동"(연어 덮밥)은 술이 아니다
    patterns: [/사케(?!동)/, /(^|[^a-z])sake($|[^a-z])/],
  },
  { emoji: "🍸", words: ["칵테일", "cocktail"] },
  { emoji: "🍷", words: ["와인", "wine"] },
  {
    emoji: "🍺",
    words: ["맥주", "beer"],
    // "비어 있는"처럼 한글 속의 "비어"는 맥주가 아니다 — 앞뒤가 한글이 아닐 때만
    patterns: [/(^|[^가-힣])비어($|[^가-힣])/],
  },
  { emoji: "🌉", words: ["잠수교", "대교", "야경"] },
  { emoji: "🌸", words: ["벚꽃", "꽃놀이", "튤립", "flower"] },
  { emoji: "🍁", words: ["단풍", "가을 소풍"] },
  { emoji: "🎄", words: ["크리스마스", "christmas"] },
  { emoji: "🎃", words: ["할로윈", "핼러윈", "halloween"] },
  { emoji: "🌕", words: ["한가위", "추석", "달빛"] },
  { emoji: "🌃", words: ["빛의", "빛과", "조명", "미디어파사드", "라이팅"] },
  { emoji: "💦", words: ["워터", "물총", "물놀이"] },
  { emoji: "🧸", words: ["캐릭터", "인형", "굿즈"] },
  { emoji: "💄", words: ["뷰티", "화장품", "코스메틱", "립스틱", "beauty"] },
  { emoji: "👕", words: ["패션", "의류", "fashion"] },
  { emoji: "🍰", words: ["디저트", "케이크", "베이커리", "dessert", "cake"] },
  { emoji: "☕", words: ["커피", "로스터리", "coffee"] },
  { emoji: "🍽️", words: ["미식", "푸드", "먹거리", "레스토랑", "food"] },
  { emoji: "🛍️", words: ["마켓", "플리마켓", "시장", "market"] },
  {
    emoji: "🎉",
    words: ["축제", "페스티벌", "페어", "festival"],
    generic: true,
  },
];

const SINGLE_EMOJI =
  /^\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*$/u;

/** 이모지 한 개인지 — AI · 외부 값이 글자나 여러 개로 오는 경우를 걸러낸다 */
export function isSingleEmoji(
  value: string | null | undefined,
): value is string {
  return !!value && value.length <= 16 && SINGLE_EMOJI.test(value);
}

/** 영문 · 숫자 단어는 단어 경계로, 한글은 포함 여부로 찾는다("f1"이 "of1x"에 걸리지 않게) */
function has(text: string, word: string): boolean {
  if (/^[a-z0-9]+$/.test(word)) {
    return new RegExp(`(^|[^a-z0-9])${word}($|[^a-z0-9])`).test(text);
  }
  return text.includes(word);
}

function findIn(text: string, includeGeneric: boolean): string | null {
  const t = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.generic && !includeGeneric) continue;
    if (
      rule.words.some((w) => has(t, w)) ||
      rule.patterns?.some((re) => re.test(t))
    ) {
      return rule.emoji;
    }
  }
  return null;
}

/** 분류를 모르는 이벤트(홈의 "지금 열린 이벤트" 등)에 키워드도 없을 때 쓰는 이벤트 기본 이모지 */
export const DEFAULT_EVENT_EMOJI = "🎫";

export interface EmojiSource {
  /** 항목에 직접 정해 둔(또는 BE 가 내려준) 이모지 */
  emoji?: string | null;
  name: string;
  description?: string | null;
}

/** 목록 아이콘에 올릴 이모지. 못 정하면 null — 호출한 쪽이 분류 이모지를 쓴다 */
export function resolveItemEmoji(item: EmojiSource): string | null {
  if (isSingleEmoji(item.emoji)) return item.emoji;
  return (
    findIn(item.name, true) ??
    (item.description ? findIn(item.description, false) : null)
  );
}
