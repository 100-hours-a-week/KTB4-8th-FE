/* 코스 만드는 중 화면(ProgressView)에 보이는 진행 문구 — 문구를 바꾸려면 이 파일만 고치면 된다.

   · 서버(BE v3)는 단계 값(stage)만 보내고, 화면 문구는 FE 가 정한다.
       outing-course-recommendation.status  { "stage": "retrieving" }
     stage 는 AI 서버가 정하는 값을 BE 가 그대로 전달한다. 단계는 건너뛸 수 있고,
     아래에 없는 stage 는 화면에 보이지 않는다(새 단계가 생기면 여기에 한 줄 추가).
   · v3 가 없는 서버(v2 · v1)는 단계를 알려 주지 않아서, 시간이 지나면 다음 줄로 넘어가는 문구(TIMED_LINES)를 쓴다. */

/** stage → 문구. 객체의 순서가 곧 화면에 쌓이는 순서는 아니다 — 서버가 알려 준 순서대로 보인다 */
export const STAGE_LINES: Readonly<Record<string, string>> = {
  retrieving: "좋아요 영상에서 찾은 장소를 모으는 중",
  reranking: "조건에 맞는 장소를 추리는 중",
  composing: "코스를 구성하는 중",
  routing: "이동 순서를 계산하는 중",
};

/** 단계를 알 수 없을 때(v2 · v1) 0.7초마다 한 줄씩 보여 주는 문구 */
export const TIMED_LINES: readonly string[] = [
  "좋아요 영상에서 찾은 장소를 모으는 중",
  "조건에 맞는 장소를 추리는 중",
  "이동 순서를 계산하는 중",
];

/** 서버가 알려 준 stage 를 화면 줄 목록에 더한다. 모르는 값 · 이미 있는 값은 건너뛴다(같은 객체를 돌려주면 다시 그리지 않는다) */
export function addStage(stages: readonly string[], stage: string): string[] {
  if (!(stage in STAGE_LINES) || stages.includes(stage))
    return stages as string[];
  return [...stages, stage];
}
