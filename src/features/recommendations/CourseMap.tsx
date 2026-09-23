"use client";

import { useEffect, useRef, useState } from "react";
import type { CandidateComponent } from "@/types/api";

/* 코스 상세 지도 — 네이버 지도 API v3.
   이 파일은 CandidateDetailSheet 에서 next/dynamic({ ssr: false }) 으로만 불러온다.
   네이버 지도 스크립트는 로드되는 즉시 브라우저 전역(window)을 건드리므로 서버에서 실행되면 안 된다.

   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID(NAVER Cloud Platform Maps 애플리케이션의 Client ID)가
   없거나 스크립트 로드·인증에 실패하면, 혹은 애초에 좌표가 없으면 기존 도식(SVG) 플레이스홀더로 되돌린다. */

const NAVER_MAPS_SCRIPT_SRC = "https://oapi.map.naver.com/openapi/v3/maps.js";

let naverMapsPromise: Promise<typeof naver> | null = null;

/** 네이버 지도 스크립트를 한 번만 로드하고, 이후 호출은 같은 프로미스를 재사용한다 */
function loadNaverMaps(): Promise<typeof naver> {
  if (typeof window !== "undefined" && window.naver?.maps) {
    return Promise.resolve(window.naver);
  }
  if (naverMapsPromise) return naverMapsPromise;
  naverMapsPromise = new Promise((resolve, reject) => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      reject(
        new Error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 설정되지 않았습니다."),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `${NAVER_MAPS_SCRIPT_SRC}?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver);
      else reject(new Error("네이버 지도 스크립트를 불러오지 못했습니다."));
    };
    script.onerror = () => {
      naverMapsPromise = null; // 다음 시도 때 다시 로드할 수 있게 한다
      reject(new Error("네이버 지도 스크립트를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
  return naverMapsPromise;
}

interface MapPoint {
  lat: number;
  lng: number;
  sequence: number;
  name: string;
}

export function CourseMap({
  components,
}: {
  components: CandidateComponent[];
}) {
  const points: MapPoint[] = components
    .filter(
      (c): c is CandidateComponent & { latitude: number; longitude: number } =>
        typeof c.latitude === "number" && typeof c.longitude === "number",
    )
    .map((c) => ({
      lat: c.latitude,
      lng: c.longitude,
      sequence: c.sequence,
      name: c.name,
    }));

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [broken, setBroken] = useState(points.length === 0);
  const pointsKey = points
    .map((p) => `${p.sequence}:${p.lat},${p.lng}`)
    .join("|");

  useEffect(() => {
    if (!points.length || !containerRef.current) return;
    let cancelled = false;
    let map: naver.maps.Map | null = null;

    loadNaverMaps()
      .then((ns) => {
        if (cancelled || !containerRef.current) return;
        const latlngs = points.map((p) => new ns.maps.LatLng(p.lat, p.lng));

        map = new ns.maps.Map(containerRef.current, {
          center: latlngs[0],
          zoom: 15,
          zoomControl: false,
          scrollWheel: false,
          scaleControl: false,
          mapDataControl: false,
        });

        if (latlngs.length > 1) {
          new ns.maps.Polyline({
            map,
            path: latlngs,
            strokeColor: "#16A46B",
            strokeWeight: 3,
            strokeOpacity: 0.9,
            strokeStyle: "shortdash",
            strokeLineCap: "round",
          });
        }

        points.forEach((p, i) => {
          new ns.maps.Marker({
            map: map!,
            position: latlngs[i],
            title: p.name,
            icon: {
              content: `<span class="route__pin route__pin--live">${p.sequence}</span>`,
              size: { width: 30, height: 30 },
              anchor: { x: 15, y: 15 },
            },
          });
        });

        if (latlngs.length > 1) {
          map.fitBounds(latlngs, {
            top: 34,
            right: 34,
            bottom: 34,
            left: 34,
            maxZoom: 16,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setBroken(true);
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
    // pointsKey(좌표 조합)가 바뀔 때만 지도를 새로 만든다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey]);

  if (broken) return <SchematicRoute components={components} />;
  return (
    <div
      ref={containerRef}
      className="route route--live"
      role="img"
      aria-label="코스 경로 지도"
    />
  );
}

/** 좌표가 없거나 네이버 지도 로드·인증에 실패했을 때의 도식 대체 화면(프로토타입의 기존 플레이스홀더와 동일) */
function SchematicRoute({ components }: { components: CandidateComponent[] }) {
  const n = Math.max(1, components.length - 1);
  const pts = components.map((_, i) => ({
    x: 14 + i * (68 / n),
    y: 20 + (i % 2 === 0 ? 0 : 32) + i * (22 / n),
  }));
  const path = `M${pts.map((p) => `${p.x + 4} ${p.y + 9}`).join(" L")}`;
  return (
    <div className="route">
      <svg
        className="route__line"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path vectorEffect="non-scaling-stroke" d={path} />
      </svg>
      {components.map((c, i) => (
        <span
          key={c.sequence}
          className="route__pin"
          style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
        >
          {c.sequence}
        </span>
      ))}
      <span className="route__label">지도 · 코스 경로 및 Place 마커</span>
    </div>
  );
}
