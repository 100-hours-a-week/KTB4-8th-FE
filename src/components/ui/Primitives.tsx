"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { CATEGORY_LABEL } from "@/lib/constants";
import { initials } from "@/lib/format";
import type { Category } from "@/types/api";

/* 반복해서 쓰는 작은 조각들 — 프로토타입의 클래스명을 그대로 쓴다. */

export const categoryLabel = (c?: Category | null) =>
  c ? CATEGORY_LABEL[c] || c : "";

const GLYPH: Record<string, string> = {
  CAFE: "☕️",
  DESSERT: "🍰",
  RESTAURANT: "🍜",
  BAR: "🍻",
  POPUP: "🛍️",
  SELECTSHOP: "🧦",
  EXHIBITION: "🖼️",
  PERFORMANCE: "🎭",
  WALK: "🌿",
  ETC: "📍",
};

/** 이미지 자리 — MVP는 더미 데이터라 카테고리별 그라데이션으로 대신 그린다 */
export function Thumb({
  category,
  className,
  children,
}: {
  category?: Category | string | null;
  className?: string;
  children?: ReactNode;
}) {
  const cat = category || "ETC";
  return (
    <div className={`thumb ${className || ""}`} data-cat={cat}>
      <span className="thumb__veil" />
      <span className="thumb__glyph">{GLYPH[cat] || GLYPH.ETC}</span>
      {children}
    </div>
  );
}

export function Skeleton({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  return <div className={`skeleton ${className || ""}`} style={style} />;
}

export function Spinner() {
  return <span className="spinner" />;
}

export function Empty({
  icon = "bookmark",
  title,
  message,
  actions,
}: {
  icon?: IconName;
  title: string;
  message?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon name={icon} size={28} />
      </div>
      <p className="empty__title">{title}</p>
      {message && <p className="empty__msg">{message}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}

export function Chip({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "tag";
  className?: string;
}) {
  const cls = [
    "chip",
    tone === "tag" ? "chip--tag" : "",
    tone === "brand" ? "chip--tag chip--brand" : "",
    tone === "accent" ? "chip--tag chip--accent" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{children}</span>;
}

/* ── 아바타 ────────────────────────────────────────────────
   profileImageUrl 규칙
     "preset:g3:🌿"  → 기본 아바타(그라데이션 g3 + 이모지)
     그 외 문자열     → 이미지 URL / dataURL
     null            → 이니셜 */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export function parseProfileImage(url?: string | null) {
  if (!url) return null;
  if (String(url).startsWith("preset:")) {
    const p = String(url).split(":");
    return { type: "preset" as const, grad: p[1] || "g1", emoji: p[2] || "🧡" };
  }
  return { type: "image" as const, src: url };
}

export function Avatar({
  nickname,
  profileImageUrl,
  size = "md",
  className,
}: {
  nickname?: string | null;
  profileImageUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const info = parseProfileImage(profileImageUrl);
  const cls = `avatar avatar--${size}${className ? " " + className : ""}`;

  if (info?.type === "image") {
    return (
      <span className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={info.src} alt="" />
      </span>
    );
  }
  if (info?.type === "preset") {
    return (
      <span className={`${cls} avatar--${info.grad}`}>
        <span style={{ fontSize: "1.35em", lineHeight: 1 }}>{info.emoji}</span>
      </span>
    );
  }
  return <span className={cls}>{initials(nickname)}</span>;
}

/** 업로드한 이미지를 정사각 256px 로 줄여 dataURL 로 만든다 */
export function imageToDataUrl(file: File, side = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type))
      return reject(new Error("IMAGE_ONLY"));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("TOO_LARGE"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("DECODE_FAILED"));
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = side;
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("CANVAS_FAILED"));
        const m = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - m) / 2,
          (img.height - m) / 2,
          m,
          m,
          0,
          0,
          side,
          side,
        );
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** 기본 아바타 프리셋 — PATCH /user 가 받는 profileImageId 를 그대로 들고 있다 */
export const AVATAR_PRESETS = [
  { id: "301", grad: "g1", emoji: "🧡" },
  { id: "302", grad: "g2", emoji: "🌿" },
  { id: "303", grad: "g3", emoji: "🌸" },
  { id: "304", grad: "g4", emoji: "🌊" },
  { id: "305", grad: "g5", emoji: "⭐" },
  { id: "306", grad: "g6", emoji: "🍀" },
  { id: "307", grad: "g1", emoji: "☕" },
  { id: "308", grad: "g2", emoji: "🎈" },
];
