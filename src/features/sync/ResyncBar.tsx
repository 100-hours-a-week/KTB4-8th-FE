"use client";

import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Primitives";
import type { Resync } from "./useResync";

/* 마이페이지에서 좋아요 영상을 다시 불러올 때 화면 아래(탭바 위)에 뜨는 얇은 반투명 막대.
   홈의 큰 카드보다 작게(제목 13px · 설명 11.5px · 버튼 30px) 만들었고, 뒤 화면이 비치는 블러 유리 느낌이다.
   분석 중에는 진행률 · 남은 시간, 끝나면 "보관함 보기" 버튼이 나온다. */

interface Props {
  resync: Resync;
  onOpenCollection: () => void;
}

export function ResyncBar({ resync, onOpenCollection }: Props) {
  const { state, progress } = resync;
  if (state === "idle") return null;

  if (state === "pending") {
    return (
      <div className="rsbar" role="status" aria-live="polite">
        <div className="rsbar__row">
          <Spinner />
          <p className="rsbar__title">
            {progress ? "AI 분석 중" : "불러오는 중"}
          </p>
          {progress && (
            <span className="rsbar__eta">
              {progress.capped
                ? "조금만 더 기다려 주세요"
                : "시간이 걸릴 수 있어요"}
            </span>
          )}
        </div>
        <p className="rsbar__sub">
          {progress
            ? progress.capped
              ? "영상이 많아 시간이 더 걸리고 있어요."
              : "영상 속 장소와 이벤트를 찾고 있어요."
            : "영상 수에 따라 시간이 걸릴 수 있어요."}
        </p>
        {progress && (
          <div className="rsbar__bar">
            <i style={{ width: `${progress.percent}%` }} />
          </div>
        )}
      </div>
    );
  }

  // 개수는 BE 에 진행률 · 결과 조회 API 가 생기면 보여 준다 — 그 전에는 숫자 없는 문구만 쓴다
  const model =
    state === "done"
      ? {
          icon: "check" as const,
          title: "좋아요 영상을 정리했어요",
          sub: "보관함에서 확인해 보세요.",
          action: "보관함 보기",
          run: onOpenCollection,
        }
      : state === "empty"
        ? {
            icon: "search" as const,
            title: "찾은 장소가 없어요",
            sub: "장소가 나오는 쇼츠에 좋아요를 누른 뒤 다시 불러와 보세요.",
            action: "다시 불러오기",
            run: () => void resync.start(),
          }
        : state === "slow"
          ? {
              icon: "clock" as const,
              title: "분석이 계속되고 있어요",
              sub: "영상이 많아 시간이 더 걸려요. 잠시 뒤 보관함에서 확인해 주세요.",
              action: "보관함 보기",
              run: onOpenCollection,
            }
          : {
              icon: "alert" as const,
              title: "불러오지 못했어요",
              sub: "일시적인 문제예요. 다시 시도해 주세요.",
              action: "다시 시도",
              run: () => void resync.start(),
            };

  return (
    <div className="rsbar" role="status" aria-live="polite">
      <div className="rsbar__row">
        <span className={`rsbar__ico rsbar__ico--${state}`}>
          <Icon name={model.icon} size={16} />
        </span>
        <div className="rsbar__text">
          <p className="rsbar__title">{model.title}</p>
          <p className="rsbar__sub rsbar__sub--tight">{model.sub}</p>
        </div>
        <button className="rsbar__btn" type="button" onClick={model.run}>
          {model.action}
        </button>
        <button
          className="rsbar__x"
          type="button"
          aria-label="닫기"
          onClick={resync.dismiss}
        >
          <Icon name="close" size={13} />
        </button>
      </div>
    </div>
  );
}
