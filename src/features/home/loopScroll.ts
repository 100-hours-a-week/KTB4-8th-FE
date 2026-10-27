/* 가로 넘김을 "끝에서 처음으로 이어지는" 고리로 만드는 공통 도구.
   맨 뒤에 처음 몇 장을 똑같이 한 번 더 붙여 두고(복제), 복제 구간에 도착하면 사용자가 모르게 진짜 처음 자리로 순간 이동한다.
   복제와 진짜 처음이 똑같이 생겼으니 눈에는 "계속 오른쪽으로 넘어가다 처음이 다시 나온" 것처럼 보인다.
   (예전에는 마지막 장에서 처음으로 되돌릴 때 왼쪽으로 빠르게 스크롤돼서 어색했다.) */

/** 모든 이벤트 · 장소 카드의 자동 넘김 간격 */
export const AUTO_MS = 4000;
/** 사용자가 만진 뒤 자동 넘김을 쉬는 시간 */
export const RESUME_AFTER_MS = 9000;
/** 스크롤이 멈춘 뒤 이 시간이 지나야 순간 이동한다(움직이는 도중에 끊기지 않게) */
const SETTLE_MS = 90;

/** 부드러운 움직임 없이 바로 그 위치로 — 스냅과 CSS smooth 를 잠깐 꺼서 정확히 그 자리에 선다 */
function jumpTo(el: HTMLElement, left: number) {
  const prevSnap = el.style.scrollSnapType;
  const prevBehavior = el.style.scrollBehavior;
  el.style.scrollSnapType = "none";
  el.style.scrollBehavior = "auto";
  el.scrollLeft = left;
  requestAnimationFrame(() => {
    el.style.scrollSnapType = prevSnap;
    el.style.scrollBehavior = prevBehavior;
  });
}

/** 스크롤이 복제 구간(loopWidth 이상)에 들어와 멈추면 진짜 구간의 같은 모습으로 옮긴다.
    loopWidth: 진짜 카드(장) 전체의 가로 길이 = 첫 복제가 시작하는 위치. 손가락이 닿아 있는 동안에는 건드리지 않는다. */
export function createLoopSettler(
  getEl: () => HTMLElement | null,
  getLoopWidth: (el: HTMLElement) => number,
  isTouching: () => boolean,
) {
  let timer = 0;
  const settle = () => {
    const el = getEl();
    if (!el || isTouching()) return;
    const loop = getLoopWidth(el);
    if (loop > 0 && el.scrollLeft >= loop - 1) jumpTo(el, el.scrollLeft - loop);
  };
  return {
    /** scroll 이벤트마다 부른다 */
    onScroll() {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    },
    settle,
    dispose() {
      window.clearTimeout(timer);
    },
  };
}

/** 사용자가 위에서 만지고 있는지 추적하고, 놓으면 콜백을 부른다 */
export function trackTouching(el: HTMLElement, onRelease: () => void) {
  let touching = false;
  const down = () => {
    touching = true;
  };
  const up = () => {
    touching = false;
    window.setTimeout(onRelease, 400);
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("touchstart", down, { passive: true });
  window.addEventListener("pointerup", up);
  window.addEventListener("touchend", up);
  window.addEventListener("pointercancel", up);
  return {
    isTouching: () => touching,
    dispose() {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("touchstart", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("touchend", up);
      window.removeEventListener("pointercancel", up);
    },
  };
}
