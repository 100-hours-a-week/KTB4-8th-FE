"use client";

import { useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Empty, Skeleton } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { fmtDot, fmtHm } from "@/lib/format";
import {
  useMarkNotificationRead,
  useNotificationDetail,
  useNotifications,
} from "./queries";
import type { AppNotification } from "@/types/api";

/* 알림함 — 프로토타입 js/pages/home.js 의 openNotificationSheet() 를 그대로 옮겼다.
   행을 탭하면 읽음 처리(PATCH) 후 전체 문구를 다시 조회(GET)해 토스트로 보여준다
   (프로토타입도 별도 상세 화면 없이 토스트로 "상세"를 보여준다). */

export interface NotificationSheetProps {
  onClose: () => void;
}

export function NotificationSheet({ onClose }: NotificationSheetProps) {
  const { data, isLoading, isError, error } = useNotifications();
  const markRead = useMarkNotificationRead();
  const detail = useNotificationDetail();

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  async function handleTap(n: AppNotification) {
    try {
      await markRead.mutateAsync(n.id);
      const full = await detail.mutateAsync(n.id);
      toast.info(full.body, full.title);
    } catch (err) {
      toast.fromError(err);
    }
  }

  const rows = data ?? [];

  return (
    <Sheet
      title="알림"
      sub="이벤트 임박 · 분석 완료 소식"
      compact
      expandable
      onClose={onClose}
    >
      {isLoading && (
        <>
          <Skeleton style={{ height: 64, marginBottom: 8, borderRadius: 14 }} />
          <Skeleton style={{ height: 64, borderRadius: 14 }} />
        </>
      )}
      {isError && (
        <Empty
          icon="alert"
          title="알림을 불러오지 못했어요."
          message="잠시 후 다시 시도해 주세요."
        />
      )}
      {!isLoading && !isError && rows.length === 0 && (
        <Empty
          icon="bell"
          title="새 알림이 없어요."
          message="이벤트 임박과 분석 완료 소식을 여기서 알려드릴게요."
        />
      )}
      {rows.length > 0 && (
        <div className="stagger">
          {rows.map((n) => (
            <button
              key={n.id}
              className={`notirow${n.read ? "" : " notirow--unread"}`}
              type="button"
              onClick={() => void handleTap(n)}
            >
              <span className="notirow__ico">
                <Icon
                  name={n.type === "EVENT_REMINDER" ? "ticket" : "sparkle"}
                  size={18}
                />
              </span>
              <span className="notirow__body">
                <span className="notirow__title">{n.title}</span>
                <span className="notirow__text">{n.body}</span>
                <span className="notirow__time">
                  {fmtDot(new Date(n.createdAt))} {fmtHm(n.createdAt)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}
