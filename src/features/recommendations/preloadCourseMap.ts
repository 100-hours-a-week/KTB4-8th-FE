import { loadNaverMaps } from "@/lib/naverMaps";

/* 코스 지도를 미리 준비한다 — 코스 상세를 열 때 지도가 늦게 뜨는 시간을 줄인다.
   지도는 ① 지도 화면 코드(CourseMap 조각)를 받고 ② 네이버 지도 스크립트(약 320KB)를 받아 실행한 뒤 ③ 지도를 그리는 순서로
   뜨는데, 예전에는 코스 상세를 여는 순간에야 ①②를 시작해서 그만큼 빈 칸으로 기다렸다.
   그래서 코스 추천을 만드는 동안 · 코스 목록이 보일 때 · 보관함에 코스가 있을 때 미리 받아 둔다(한 번만 시작하고, 브라우저가 한가할 때). */
let started = false;

export function preloadCourseMap() {
  if (started || typeof window === "undefined") return;
  started = true;
  const run = () => {
    // 키가 없거나 네트워크 오류면 실패 — 코스 상세를 열 때 CourseMap 이 다시 시도하고 도식 화면으로 대신한다
    loadNaverMaps().catch(() => {
      started = false;
    });
    void import("./CourseMap");
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 1500 });
  } else {
    globalThis.setTimeout(run, 200);
  }
}
