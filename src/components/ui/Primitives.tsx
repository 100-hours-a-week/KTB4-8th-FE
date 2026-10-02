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
  className,
}: {
  icon?: IconName;
  title: string;
  message?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `empty ${className}` : "empty"}>
      <div className="empty__icon">
        <Icon name={icon} size={28} />
      </div>
      <p className="empty__title">{title}</p>
      {message && <p className="empty__msg">{message}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  );
}

/** 장소·이벤트 상세가 테스트용 더미 데이터일 때 띄우는 안내 배너.
    지금은 보관함·추천에 실제로 뜨는 장소·이벤트가 전부 더미라서 예외 없이 쓰지만,
    BE 에 실제 장소 상세 API 가 생기면 그걸로 받아온 항목에는 안 띄워야 한다. */
export function DummyDataNotice() {
  return (
    <div className="banner banner--info" style={{ marginBottom: 16 }}>
      <Icon name="info" size={18} />
      <span className="banner__msg">
        지금 보시는 장소 정보는 서비스 점검을 위해 넣어둔 예시 데이터예요. 실제
        장소 정보가 아니니 참고해 주세요.
      </span>
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
     "preset:0288d1:b2dbef"  → 기본 아바타(배경색 + 실루엣 색, # 없는 6자리 hex)
     그 외 문자열              → 이미지 URL / dataURL
     null                     → 이니셜 */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export function parseProfileImage(url?: string | null) {
  if (!url) return null;
  if (String(url).startsWith("preset:")) {
    const p = String(url).split(":");
    return {
      type: "preset" as const,
      bg: p[1] || "4a4a52",
      icon: p[2] || "ffffff",
    };
  }
  return { type: "image" as const, src: url };
}

/** YouTube 기본 프로필 사진과 같은 모양의 사람 실루엣 — 배경색 위에 한 단계 밝은 색으로 그린다.
    ~/Downloads/유튜브_기본프로필2 의 실제 레퍼런스 PNG(800×800)를 픽셀 단위로 측정해 좌표를
    뽑았다 — 몸통은 원 가장자리까지 채우지 않고 옆에 배경색 여백을 뚜렷이 남긴다(돔 모양 상단 +
    곧은 옆선). 그 측정값을 100×100 뷰박스 기준으로 옮긴 값이 아래 좌표다.
    presetToBlob() 도 같은 좌표로 PNG 를 그려야 해서 상수로 뺐다. */
const PERSON_HEAD = { cx: 50, cy: 39, r: 16 };
const PERSON_BODY_PATH = "M 18 79 A 32 15 0 0 1 82 79 L 82 105 L 18 105 Z";

export function PersonGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle
        cx={PERSON_HEAD.cx}
        cy={PERSON_HEAD.cy}
        r={PERSON_HEAD.r}
        fill={color}
      />
      <path d={PERSON_BODY_PATH} fill={color} />
    </svg>
  );
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
      <span className={cls} style={{ background: `#${info.bg}` }}>
        <PersonGlyph color={`#${info.icon}`} />
      </span>
    );
  }
  return <span className={cls}>{initials(nickname)}</span>;
}

/** 업로드한 이미지를 정사각 256px 로 줄여 Blob 으로 만든다 — 화면 미리보기는
    URL.createObjectURL(blob) 으로, 저장은 이 Blob 을 그대로 POST /user/profile-image 에 올린다. */
export function imageToBlob(file: File, side = 256): Promise<Blob> {
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
        c.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("BLOB_FAILED"))),
          "image/jpeg",
          0.82,
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** 기본 아바타 프리셋(배경색 + 실루엣)을 PNG Blob 으로 그린다 — PersonGlyph 와 같은
    좌표를 쓰는 SVG 를 캔버스에 그려서 만든다. 프리셋도 실제 파일처럼
    POST /user/profile-image 로 올려야 PATCH /user 에서 유효한 storagePath 로 쓸 수 있다. */
export function presetToBlob(
  bg: string,
  icon: string,
  side = 256,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<circle cx="50" cy="50" r="50" fill="#${bg}"/>` +
      `<circle cx="${PERSON_HEAD.cx}" cy="${PERSON_HEAD.cy}" r="${PERSON_HEAD.r}" fill="#${icon}"/>` +
      `<path d="${PERSON_BODY_PATH}" fill="#${icon}"/>` +
      `</svg>`;
    const img = new window.Image();
    img.onerror = () => reject(new Error("SVG_DECODE_FAILED"));
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = side;
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new Error("CANVAS_FAILED"));
      ctx.drawImage(img, 0, 0, side, side);
      c.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("BLOB_FAILED"))),
        "image/png",
      );
    };
    img.src = "data:image/svg+xml;base64," + btoa(svg);
  });
}

/** "기본 이미지(이니셜)로 되돌리기" 를 PNG Blob 으로 그린다 — Avatar 의 이니셜 폴백(.avatar 기본
    배경 #4a4a52 · 흰 글자)과 같은 모양이다. BE 에 "사진 없음"을 표현할 방법이 없어서, 이니셜
    자체를 진짜 이미지로 만들어 POST /user/profile-image 로 올리는 걸로 대신한다. */
export function initialsToBlob(nickname: string, side = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const c = document.createElement("canvas");
    c.width = c.height = side;
    const ctx = c.getContext("2d");
    if (!ctx) return reject(new Error("CANVAS_FAILED"));
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(side / 2, side / 2, side / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(side * 0.36)}px -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(nickname), side / 2, side / 2);
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("BLOB_FAILED"))),
      "image/png",
    );
  });
}

/** 기본 아바타 프리셋 — YouTube 기본 프로필 사진과 같은 배색(배경 · 실루엣) */
export const AVATAR_PRESETS = [
  { id: "401", bg: "8b6d62", icon: "dcd3ce" }, // 갈색
  { id: "402", bg: "008779", icon: "b2dbd7" }, // 녹색
  { id: "403", bg: "5c6bc0", icon: "ccd2ea" }, // 보라
  { id: "404", bg: "7a1fa2", icon: "d6bce3" }, // 자주
  { id: "405", bg: "f5511e", icon: "facbbb" }, // 주황
  { id: "406", bg: "465a65", icon: "c5cdd0" }, // 차콜
  { id: "408", bg: "0288d1", icon: "b2dbef" }, // 파랑
  { id: "409", bg: "92bcd4", icon: "c7ddea" }, // 하늘색
];
