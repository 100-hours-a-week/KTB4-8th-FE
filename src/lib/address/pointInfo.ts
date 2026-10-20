import type { PointInfoResponse } from "@/app/bff/regions/point-info/route";
import type { AddressHit } from "./address";

/* 지도 핀 위치를 설명하는 정보 — 가까운 지하철역, 도로명·지번 주소, 건물명.
   카카오 키가 필요해서 BFF(/bff/regions/point-info)를 거친다. */

export type PointInfo = PointInfoResponse;

/** 핀이 이 거리(m) 안에 있으면 지하철역 이름으로 보여 준다 */
export const STATION_SNAP_M = 100;

/** 핀이 출구에서 이 거리(m) 안에 있으면 "OO역 N번 출구"로 보여 준다 */
export const EXIT_SNAP_M = 10;

/** 조회에 실패하면 null — 호출하는 쪽에서 법정동 같은 기본 표시로 대체한다 */
export async function fetchPointInfo(
  lat: number,
  lng: number,
): Promise<PointInfo | null> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });
    const res = await fetch(`/bff/regions/point-info?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PointInfo;
  } catch {
    return null;
  }
}

/** 위치를 사람이 읽는 이름으로 정리한 결과 */
export interface PlaceView {
  /** 가장 눈에 띄는 이름 */
  title: string;
  /** 그 밑에 보이는 상세 주소 */
  sub: string;
  /** 지하철역·출구일 때 지나는 노선(카카오 category 원문) */
  lines: string[];
  /** 도로명 주소 옆에 보조로 붙는 건물명(핀 화면). 제목은 건물명이 아니라 법정동·역·출구다 */
  note?: string;
  /** 출구 근처의 주요 시설(KRIC). 출구일 때만 있다 */
  facilities?: string[];
}

/**
 * 법정동(지역 DB 매칭)과 위치 정보를 합쳐 화면에 보일 이름을 고른다.
 * 제목은 출구 > 역(100m 안) > 법정동 순이고, 건물명은 제목이 아니라 도로명 옆의 보조 정보(note)다.
 *  - "pin"    지도 핀 — 건물명을 note 로 붙이고, 출구면 주변 시설(facilities)도 붙인다
 *  - "region" 현재 위치로 설정 — 건물명 없이 제목과 상세 주소만 쓴다
 * 상세 주소는 늘 핀 위치의 도로명 주소이고, 도로명이 없는 곳(광장·공원 등)만 법정동의 지번 주소다.
 */
export function describePoint(
  hit: AddressHit | null,
  info: PointInfo | null,
  mode: "pin" | "region",
): PlaceView | null {
  const station = info?.station;
  const address = info?.address;
  const regionSub = hit?.sub ?? "";
  const detail = address?.road || address?.jibun || "";
  /* 장소명이 없을 때 제목으로 쓰는 법정동. 카카오 지번 주소의 구·동이 가장 정확하고(행정동과 헷갈리지 않는다),
     없으면 지역 DB에서 맞춘 이름을 쓴다. */
  const region = address?.region || hit?.label || "";
  const note = mode === "pin" ? address?.building || undefined : undefined;

  // 출구 가까이에 있으면 몇 번 출구인지까지 보여 준다. 출구는 역 중심에서 멀 수 있어서 역 거리와 별개로 본다.
  if (station?.exit && station.exit.distanceM <= EXIT_SNAP_M) {
    const { exit } = station;
    return {
      title: `${station.name} ${exit.number}번 출구`,
      sub: detail || station.address || regionSub,
      // 노선을 모르는 출구는 틀린 노선을 보이지 않도록 배지를 빼고 번호만 보여 준다
      lines: exit.line ? [exit.line] : [],
      // 출구 아래의 건물은 지하라 의미가 없어서 건물명 대신 주변 시설을 보여 준다
      facilities:
        mode === "pin" && exit.facilities?.length ? exit.facilities : undefined,
    };
  }
  // 출구는 아니어도 역 가까이면 역 이름 밑에 핀 위치의 상세 주소를 보여 준다(역 자체의 주소가 아니다)
  if (station && station.distanceM <= STATION_SNAP_M) {
    return {
      title: station.name,
      sub: detail || station.address || regionSub,
      lines: station.lines,
      note,
    };
  }
  // 장소명이 없으면 법정동을 제목으로, 그 밑에 도로명(없으면 지번) 상세 주소를 보여 준다
  if (region)
    return { title: region, sub: detail || regionSub, lines: [], note };
  return detail ? { title: detail, sub: "", lines: [], note } : null;
}
