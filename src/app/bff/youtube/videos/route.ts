import { NextRequest, NextResponse } from "next/server";

/* 보관함 상세의 "원본 콘텐츠"(유튜브 영상) 한 줄에 보여 줄 제목 · 채널을 가져온다.
   BE 가 영상 제목을 저장하지 않아서(영상 ID 만 저장) 화면을 열 때마다 유튜브에서 읽고, 이 서버에도 저장하지 않는다.
   브라우저에서 유튜브 oEmbed 를 직접 부르면 CORS 로 막혀서 서버(BFF)가 대신 부른다.
   - YOUTUBE_API_KEY(서버 전용, 선택)가 있으면 YouTube Data API 로 읽는다. 퍼가기가 막힌 영상의 제목도 읽을 수 있고,
     목록에 없는 영상은 삭제됐거나 비공개인 영상이다.
   - 키가 없으면 oEmbed 로 읽는다. 404 · 400 이면 없는 영상, 401 은 "퍼가기만 막힌 영상"일 수도 있어
     확인 불가로 단정하지 않고 모름(unknown)으로 돌려준다. */

const VIDEO_ID = /^[\w-]{11}$/;
const MAX_IDS = 10;
const TIMEOUT_MS = 5_000;

type VideoMeta =
  | { state: "ok"; title: string; channel: string }
  | { state: "unavailable" }
  | { state: "unknown" };

interface DataApiResponse {
  items?: {
    id: string;
    snippet?: { title?: string; channelTitle?: string };
  }[];
}

interface OembedResponse {
  title?: string;
  author_name?: string;
}

async function viaDataApi(
  ids: string[],
  key: string,
): Promise<Record<string, VideoMeta> | null> {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("fields", "items(id,snippet(title,channelTitle))");
  url.searchParams.set("key", key);
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // 키가 잘못됐거나 한도를 넘으면 oEmbed 로 대신한다
  if (!res.ok) return null;
  const body = (await res.json()) as DataApiResponse;
  const found = new Map((body.items ?? []).map((item) => [item.id, item]));
  const out: Record<string, VideoMeta> = {};
  for (const id of ids) {
    const snippet = found.get(id)?.snippet;
    out[id] = snippet
      ? {
          state: "ok",
          title: snippet.title ?? "",
          channel: snippet.channelTitle ?? "",
        }
      : { state: "unavailable" };
  }
  return out;
}

async function viaOembed(id: string): Promise<VideoMeta> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    // 없는 영상은 404(삭제) 또는 400(없는 ID)으로 온다. ID 형식은 위에서 걸러서 400 은 영상이 없다는 뜻이다
    if (res.status === 404 || res.status === 400) {
      return { state: "unavailable" };
    }
    if (!res.ok) return { state: "unknown" };
    const body = (await res.json()) as OembedResponse;
    if (!body.title) return { state: "unknown" };
    return { state: "ok", title: body.title, channel: body.author_name ?? "" };
  } catch {
    return { state: "unknown" };
  }
}

export async function GET(request: NextRequest) {
  const ids = [
    ...new Set(
      (request.nextUrl.searchParams.get("ids") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
  if (
    ids.length === 0 ||
    ids.length > MAX_IDS ||
    !ids.every((id) => VIDEO_ID.test(id))
  ) {
    return NextResponse.json({ error: "INVALID_IDS" }, { status: 400 });
  }

  const key = process.env.YOUTUBE_API_KEY;
  let videos: Record<string, VideoMeta> | null = null;
  if (key) {
    try {
      videos = await viaDataApi(ids, key);
    } catch {
      videos = null;
    }
  }
  if (!videos) {
    const metas = await Promise.all(ids.map((id) => viaOembed(id)));
    videos = Object.fromEntries(ids.map((id, i) => [id, metas[i]]));
  }
  return NextResponse.json(
    { videos },
    { headers: { "Cache-Control": "no-store" } },
  );
}
