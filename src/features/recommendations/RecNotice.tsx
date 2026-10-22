"use client";

import { Icon } from "@/components/ui/Icon";

/* 코스 추천이 실패했을 때 조건 카드 위에 닫을 때까지 남는 안내.
   토스트는 3초 만에 사라져서 테스트하는 사람이 원인을 놓쳤다. 어떤 단계에서 왜 실패했는지 한 줄로 남기고, 다시 시도 · 다음 행동 버튼을 둔다. */

export interface RecNoticeModel {
  title: string;
  text: string;
  /** "503 · INTERNAL_SERVER_ERROR" 같은 확인용 코드(작게 보인다) */
  code?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function RecNotice({
  notice,
  onClose,
}: {
  notice: RecNoticeModel;
  onClose: () => void;
}) {
  return (
    <div className="recnote" role="alert">
      <span className="recnote__ico">
        <Icon name="alert" size={16} />
      </span>
      <div className="recnote__body">
        <p className="recnote__title">{notice.title}</p>
        <p className="recnote__text">{notice.text}</p>
        {notice.code && <p className="recnote__code">{notice.code}</p>}
        {notice.actionLabel && notice.onAction && (
          <button
            className="recnote__btn"
            type="button"
            onClick={notice.onAction}
          >
            {notice.actionLabel}
          </button>
        )}
      </div>
      <button
        className="recnote__x"
        type="button"
        aria-label="닫기"
        onClick={onClose}
      >
        <Icon name="close" size={13} />
      </button>
    </div>
  );
}
