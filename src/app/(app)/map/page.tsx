"use client";

import { AppBar } from "@/components/ui/AppBar";
import { Empty } from "@/components/ui/Primitives";

/* 08 · 지도 — v3 범위. 프로토타입 js/pages/map.js 와 마찬가지로 자리만 잡아두고 안내한다. */
export default function MapPage() {
  return (
    <>
      <AppBar back title="지도" />
      <div className="scroll scroll--pad">
        <div className="route" style={{ height: 260 }}>
          <span className="route__pin" style={{ left: "22%", top: "30%" }}>
            1
          </span>
          <span className="route__pin" style={{ left: "54%", top: "52%" }}>
            2
          </span>
          <span className="route__pin" style={{ left: "76%", top: "24%" }}>
            3
          </span>
          <span className="route__label">지도 SDK 연동 영역</span>
        </div>
        <Empty
          icon="map"
          title="준비 중인 기능입니다."
          message={
            <>
              저장한 장소를 지도에서 탐색하는 기능은
              <br />
              v3에서 제공할 예정이에요.
            </>
          }
        />
      </div>
    </>
  );
}
