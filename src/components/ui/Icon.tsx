"use client";

/* 인라인 SVG 아이콘 — 외부 아이콘 폰트를 쓰지 않는다.
   프로토타입 js/icons.js 의 path 를 그대로 이관했다. */

export const ICON_PATHS = {
  back: '<path d="M15 19l-7-7 7-7"/>',
  close: '<path d="M18 6L6 18M6 6l12 12"/>',
  refresh: '<path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  chevronDown: '<path d="M5 9l7 7 7-7"/>',
  arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>',
  bookmarkFill:
    '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill="currentColor"/>',
  expand:
    '<path d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"/>',
  collapse:
    '<path d="M3 9h4a2 2 0 002-2V3M21 9h-4a2 2 0 01-2-2V3M3 15h4a2 2 0 012 2v4M21 15h-4a2 2 0 00-2 2v4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"/><circle cx="12" cy="10" r="2.6"/>',
  home: '<path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20z"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.4 9.4 0 01-3.8-.8L3 21l1.9-4.6A8.4 8.4 0 013 11.5a8.4 8.4 0 019-8.4 8.4 8.4 0 019 8.4z"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 21a7.5 7.5 0 0115 0"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M11 9.5l4 2.5-4 2.5z" fill="currentColor"/>',
  sparkle:
    '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  route:
    '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6h5a4 4 0 010 8h-3a4 4 0 000 8h4"/>',
  image:
    '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.9"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
  bell: '<path d="M18 9a6 6 0 10-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z"/><path d="M10.3 19.5a2 2 0 003.4 0"/>',
  alert: '<path d="M12 3l9.5 16.5h-19z"/><path d="M12 9.5v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
  youtube:
    '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.3 9.4l4.8 2.6-4.8 2.6z" fill="currentColor" stroke="none"/>',
  google:
    '<path d="M21 12.2c0-.7-.06-1.2-.2-1.8H12v3.3h5.1a4.4 4.4 0 01-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-6.8z" fill="#4285F4" stroke="none"/><path d="M12 21.5c2.5 0 4.6-.8 6.2-2.3l-3.1-2.4c-.8.6-1.9 1-3.1 1-2.4 0-4.4-1.6-5.2-3.8H3.6v2.4A9.5 9.5 0 0012 21.5z" fill="#34A853" stroke="none"/><path d="M6.8 14a5.7 5.7 0 010-3.6V8H3.6a9.5 9.5 0 000 8.5z" fill="#FBBC05" stroke="none"/><path d="M12 6.4c1.4 0 2.6.5 3.5 1.4l2.7-2.7A9.5 9.5 0 003.6 8l3.2 2.4c.8-2.2 2.8-4 5.2-4z" fill="#EA4335" stroke="none"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6.5 7l.8 13h9.4l.8-13"/>',
  logout:
    '<path d="M15 17l5-5-5-5M20 12H9M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h5"/>',
  pencil: '<path d="M4 20h4L20 8a2.8 2.8 0 10-4-4L4 16z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  sliders:
    '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
  map: '<path d="M9 4L3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5z"/><path d="M9 4v14M15 6.5v14"/>',
  heart:
    '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0112 8.2a4.1 4.1 0 017.5 2.4C19.5 15.4 12 20 12 20z"/>',
  camera:
    '<path d="M3 8.5A2.5 2.5 0 015.5 6h1.8l1.2-2h6l1.2 2h1.8A2.5 2.5 0 0120 8.5v9A2.5 2.5 0 0117.5 20h-11A2.5 2.5 0 014 17.5z"/><circle cx="12" cy="13" r="3.4"/>',
  upload:
    '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2.5A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5V16"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8.5 10V7.5a3.5 3.5 0 017 0V10"/>',
  shield:
    '<path d="M12 3l7.5 3v6c0 4.6-3.2 8-7.5 9.5C7.7 20 4.5 16.6 4.5 12V6z"/><path d="M9.2 12.2l2 2 3.6-3.8"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  ticket:
    '<path d="M4 8.5A2.5 2.5 0 016.5 6h11A2.5 2.5 0 0120 8.5v1.2a2.3 2.3 0 000 4.6v1.2a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 15.5v-1.2a2.3 2.3 0 000-4.6z"/><path d="M13.5 6v12"/>',
  coffee:
    '<path d="M4 8h13v6a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M17 9.5h1.5a2.5 2.5 0 010 5H17"/><path d="M7 3.5v2M11 3.5v2"/>',
  bolt: '<path d="M13.5 2.5L5 14h6l-.5 7.5L19 10h-6z"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}

/* YouTube 연동 표시용 마크.
   공식 로고는 YouTube 브랜드 가이드의 배포 파일을 써야 한다.
   `public/youtube.svg` 를 넣고 NEXT_PUBLIC_YOUTUBE_LOGO=/youtube.svg 를 설정하면 그 파일을 쓰고,
   설정이 없으면 일반 '영상 재생' 배지로 대체한다(자세한 내용은 public/README.md). */
const YT_LOGO = process.env.NEXT_PUBLIC_YOUTUBE_LOGO || "";

export function YouTubeMark({ size = 24 }: { size?: number }) {
  return (
    <span className="ytmark" style={{ width: size, height: size }}>
      {YT_LOGO ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={YT_LOGO} alt="" width={size} height={size} />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect x="2" y="5" width="20" height="14" rx="5" fill="#FF0033" />
          <path d="M10 8.9l5.4 3.1-5.4 3.1z" fill="#fff" />
        </svg>
      )}
    </span>
  );
}
