import { syncEmptyCopy } from "./emptyCopy";
import { describeAddedObject } from "./newItems";
import type { SyncBar } from "./syncStore";

/* 홈이 아닌 화면에 남는 "불러오기 결과 막대"의 문구와 모양.
   - 색: ok(초록) · warn(노랑) · info(파랑) · error(빨강)
   - 설명은 문장마다 한 줄씩 보여 준다(lines)
   - action: 막대 오른쪽 버튼. "collection" 은 보관함으로, "retry" 는 다시 불러오기. 없으면 버튼을 두지 않는다. */

export type BarTone = "ok" | "warn" | "info" | "error";
export type BarAction = "collection" | "retry";

export interface BarCopy {
  tone: BarTone;
  title: string;
  lines: string[];
  action?: { kind: BarAction; label: string };
}

/** 마침표 뒤에서 문장을 나눈다 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function barCopy(bar: SyncBar): BarCopy {
  if (bar.state === "done") {
    const places = bar.result?.addedPlaces;
    const events = bar.result?.addedEvents;
    const counted = places != null && events != null;
    const added = counted ? describeAddedObject(places, events) : "";
    const collection = { kind: "collection", label: "보관함 보기" } as const;
    if (added)
      return {
        tone: "ok",
        title: `${added} 보관함에 담았어요`,
        lines: ["좋아요 영상 정리가 끝났어요."],
        action: collection,
      };
    if (counted)
      return {
        tone: "ok",
        title: "새로 담긴 곳은 없어요",
        lines: ["새로 좋아요한 영상이 없으면 담길 장소도 없어요."],
        action: collection,
      };
    return {
      tone: "ok",
      title: "좋아요 영상을 정리했어요",
      lines: ["찾은 장소와 이벤트를 보관함에 담았어요."],
      action: collection,
    };
  }
  if (bar.state === "empty") {
    const copy = syncEmptyCopy(bar.result);
    return {
      tone: "warn",
      title: copy.toastTitle,
      lines: splitSentences(copy.msg),
      action: { kind: "retry", label: "다시 불러오기" },
    };
  }
  if (bar.state === "slow")
    return {
      tone: "info",
      title: "분석이 계속되고 있어요",
      lines: splitSentences(
        "영상이 많아 시간이 더 걸려요. 잠시 뒤 보관함에서 확인해 주세요.",
      ),
      action: { kind: "collection", label: "보관함 보기" },
    };
  if (bar.reason === "reauth")
    // 앱 안에 유튜브를 다시 연동하는 화면이 없어 버튼은 두지 않는다
    return {
      tone: "error",
      title: "유튜브 연동이 필요해요",
      lines: splitSentences(
        "연동이 안 돼 있거나 만료됐어요. 유튜브를 연동한 뒤 불러와 주세요.",
      ),
    };
  if (bar.reason === "busy")
    return {
      tone: "warn",
      title: "지금 요청이 몰려 있어요",
      lines: splitSentences(
        "서버가 바빠서 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      ),
      action: { kind: "retry", label: "다시 시도" },
    };
  return {
    tone: "error",
    title: "불러오지 못했어요",
    lines: splitSentences("일시적인 문제예요. 다시 시도해 주세요."),
    action: { kind: "retry", label: "다시 시도" },
  };
}
