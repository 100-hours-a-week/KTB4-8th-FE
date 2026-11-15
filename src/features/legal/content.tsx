import type { ReactNode } from "react";

/* 개인정보 처리방침 · 이용약관 본문 — 랜딩 모달(PolicyModal)과 앱 안 페이지(/mypage/privacy · /mypage/terms)가 함께 쓴다.
   본문은 이곳 한 군데에서만 고친다. 스타일은 쓰는 쪽이 정한다(여기서는 구조만 정하고 클래스는 붙이지 않는다). */

export const LEGAL_REVISED = "2026년 10월 1일";
export const LEGAL_VERSION = "1.2";
export const LEGAL_CONTACT_EMAIL = "kristinu998@gmail.com";
/** 문의하기 구글 폼 — 랜딩 푸터의 "문의하기"와 같은 주소 */
export const LEGAL_CONTACT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdOuhlmfDMjTOuZSHCtsIf6GmHNfjjQYk27uHuvcvEEgP2GcQ/viewform";

export type LegalBlock =
  /** 문단 */
  | { kind: "p"; text: ReactNode }
  /** 목록 */
  | { kind: "ul"; items: ReactNode[] }
  /** 작은 소제목 */
  | { kind: "sub"; text: string };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  /** 본문 맨 앞의 박스(구글 정책 준수 선언) */
  notice?: { title: string; text: ReactNode };
  /** 섹션 앞의 도입 문장 */
  intro?: ReactNode;
  sections: LegalSection[];
}

const ExtLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

/** 문의 안내 — 구글 폼 링크와 이메일 */
const CONTACT = (
  <>
    <ExtLink href={LEGAL_CONTACT_FORM_URL}>문의하기 (구글 폼)</ExtLink> /{" "}
    <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
  </>
);

const GOOGLE_PRIVACY = (
  <ExtLink href="https://policies.google.com/privacy">
    Google 개인정보처리방침
  </ExtLink>
);

export const PRIVACY: LegalDoc = {
  title: "KeepGo 개인정보처리방침",
  notice: {
    title: "🔒 Google API 서비스 사용자 데이터 정책 준수 선언",
    text: (
      <>
        KeepGo는 Google API로부터 수신한 정보의 사용 및 다른 앱으로의 이전에
        대해 제한적 사용(Limited Use) 요건을 포함한{" "}
        <strong>Google API Services User Data Policy</strong>를 전적으로
        준수합니다.
      </>
    ),
  },
  intro: (
    <>
      KeepGo(이하 “서비스”)는 이용자의 개인정보를 소중하게 생각하며, 「개인정보
      보호법」 등 관련 법령을 준수합니다.
    </>
  ),
  sections: [
    {
      title: "1. 수집하는 개인정보 항목 및 수집 방법",
      blocks: [
        {
          kind: "p",
          text: "서비스는 사용자의 원활한 소셜 로그인 및 쇼츠 기반 맞춤 코스 추천 기능을 위해 최소한의 정보를 수집합니다.",
        },
        {
          kind: "ul",
          items: [
            <>
              <strong>Google 계정 정보:</strong> Google 계정 고유 식별자,
              이름(또는 닉네임), 이메일 주소, 프로필 이미지 URL (회원 식별 및
              계정 연동)
            </>,
            <>
              <strong>인증 정보:</strong> OAuth 액세스 토큰, 리프레시 토큰 및
              토큰 유효기간 (연동 유지 및 요청 기능 제공)
            </>,
            <>
              <strong className="break-all">
                YouTube API 접근 데이터
                (https://www.googleapis.com/auth/youtube.readonly):
              </strong>{" "}
              사용자가 직접 ‘좋아요’ 표시한 동영상 중 장소 관련 콘텐츠의 영상
              ID, 제목, 채널명, 설명, 썸네일 정보 (코스 추출 목적)
            </>,
            <>
              <strong>서비스 이용 기록:</strong> AI 추출 장소 저장 목록, 생성된
              맞춤 여행 일정
            </>,
            <>
              <strong>자동 생성 정보:</strong> 접속 일시, IP 주소, 기기·브라우저
              정보, 이용 기록, 오류 로그 (보안 유지, 부정 이용 방지 및 장애
              대응)
            </>,
          ],
        },
        {
          kind: "p",
          text: "서비스는 이용자의 Google 비밀번호를 수집하거나 저장하지 않습니다.",
        },
        { kind: "sub", text: "수집 방법" },
        {
          kind: "ul",
          items: [
            "Google 로그인 및 YouTube 계정 연동 시 이용자의 동의",
            "이용자의 요청에 따라 Google 및 YouTube API가 제공하는 정보 (Google에서 받는 정보의 범위는 Google 동의 화면에서 이용자가 승인한 항목으로 한정됩니다)",
            "서비스 이용 과정에서 자동으로 생성되는 정보",
            "고객 문의 및 개인정보 관련 문의 접수 시 이용자가 제출한 정보",
          ],
        },
      ],
    },
    {
      title: "2. 개인정보 및 YouTube 데이터의 이용 목적",
      blocks: [
        {
          kind: "ul",
          items: [
            <>
              <strong>장소 정보 자동 추출:</strong> 좋아요한 유튜브 쇼츠 속
              맛집, 카페, 관광지 상호명 및 위치 자동 감지
            </>,
            <>
              <strong>맞춤 여행 동선 추천:</strong> 추출된 장소를 바탕으로 최적
              이동 경로와 일정 플래닝 제공
            </>,
            <>
              <strong>회원 식별 및 서비스 보안 관리:</strong> 불법 접근 방지 및
              개인화 설정 유지
            </>,
            <>
              <strong>서비스 제공 및 운영:</strong> 이용자가 요청한 기능 제공,
              서비스 운영 및 장애 대응
            </>,
            <>
              <strong>문의 및 권리 요청 처리:</strong> 이용자 문의와 개인정보
              관련 요청에 대한 응대
            </>,
          ],
        },
        {
          kind: "p",
          text: "수집한 정보는 위 목적 외의 용도로 이용하지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받습니다.",
        },
      ],
    },
    {
      title: "3. 개인정보의 제3자 제공 및 판매 금지",
      blocks: [
        {
          kind: "p",
          text: "KeepGo는 사용자의 사전 동의 없이 어떠한 개인정보나 YouTube API 데이터를 제3자 광고주, 데이터 브로커, 마케팅 기업에 판매하거나 제공하지 않습니다. AI 모델 학습(Gemini)에 활용되는 텍스트는 장소 추출 파이프라인 내에서 즉시 처리되며, 개인 식별 정보와 분리되어 안전하게 보호됩니다.",
        },
        {
          kind: "p",
          text: (
            <>
              다만 ① 이용자가 사전에 명시적으로 동의한 경우, ② 법령에 특별한
              규정이 있거나 법령상 의무를 지키기 위해 불가피한 경우, ③ 이용자
              또는 제3자의 생명·신체·재산을 보호하기 위해 긴급히 필요한 경우에는
              예외로 합니다. 로그인 및 YouTube API 연동 과정에서 Google이
              처리하는 정보는 {GOOGLE_PRIVACY}에 따릅니다.
            </>
          ),
        },
      ],
    },
    {
      title: "4. 개인정보 처리업무의 위탁",
      blocks: [
        {
          kind: "p",
          text: "서비스는 안정적인 운영을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.",
        },
        {
          kind: "ul",
          items: [
            <>
              <strong>수탁자:</strong> AWS (Amazon Web Services)
            </>,
            <>
              <strong>위탁 업무:</strong> 서버 운영, 데이터 저장 및 백업
            </>,
            <>
              <strong>보유 및 이용 기간:</strong> 위탁 계약 종료 시 또는 데이터
              삭제 시까지
            </>,
          ],
        },
        {
          kind: "p",
          text: "위탁 내용이 변경되는 경우 본 방침을 통해 알려 드립니다.",
        },
      ],
    },
    {
      title: "5. 데이터 보관 기간 및 파기 절차",
      blocks: [
        {
          kind: "p",
          text: "사용자가 서비스 회원 탈퇴를 요청하거나 Google 계정 연동을 해제하는 경우, 수집된 모든 프로필 데이터와 아카이빙된 개인 코스는 지체 없이(영업일 기준 3일 이내) 재생 불가능한 방법으로 완전 파기됩니다.",
        },
        { kind: "sub", text: "항목별 보관 기간" },
        {
          kind: "ul",
          items: [
            <>
              <strong>Google 계정·프로필 정보:</strong> 회원 탈퇴 또는 Google
              계정 연동 해제 시까지
            </>,
            <>
              <strong>OAuth 인증 토큰:</strong> 연동 해제, 회원 탈퇴 또는 토큰
              무효화 시까지
            </>,
            <>
              <strong>조회·저장한 YouTube API 데이터:</strong> 서비스 제공에
              필요한 기간 동안 또는 이용자가 삭제를 요청할 때까지
            </>,
            <>
              <strong>접속 및 보안 로그:</strong> 수집일로부터 3개월
            </>,
          ],
        },
        {
          kind: "p",
          text: "법령에서 보존을 요구하는 경우에 한해 보관 기간을 연장합니다. 이용자가 YouTube 접근 권한을 철회하면 인증 토큰은 즉시 폐기합니다.",
        },
        { kind: "sub", text: "파기 방법" },
        {
          kind: "p",
          text: "보관 기간이 끝나거나 처리 목적이 달성되면 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄하거나 소각합니다. 법령에 따라 보존해야 하는 정보는 별도로 분리해 보관한 뒤 기간이 끝나면 파기합니다. 회원 탈퇴 또는 계정 연동 해제 시에는 서비스 계정 정보, 인증 토큰, 저장된 YouTube 이용자 데이터를 삭제합니다.",
        },
      ],
    },
    {
      title: "6. Google 사용자 데이터의 이용 및 보호",
      blocks: [
        {
          kind: "p",
          text: "서비스는 Google 사용자 데이터를 이용자가 동의한 기능을 제공하는 목적에만 이용하며, 다음 사항을 지킵니다.",
        },
        {
          kind: "ul",
          items: [
            "광고, 신용 평가, 이용자 감시 목적으로 이용하지 않습니다.",
            "서비스 제공에 필요한 최소한의 범위에서만 접근합니다.",
            "접근 권한은 업무상 필요한 담당자로 제한합니다.",
            "다른 정보와 결합해 이용자를 부당하게 식별하거나 추적하지 않습니다.",
            "법령 준수, 보안 사고 대응, 서비스의 필수 운영을 위한 경우를 제외하고 동의한 목적 외로 이용하지 않습니다.",
          ],
        },
        {
          kind: "p",
          text: (
            <>
              참고: {GOOGLE_PRIVACY}
              {" · "}
              <ExtLink href="https://developers.google.com/youtube/terms/api-services-terms-of-service-apac?hl=ko">
                YouTube API 서비스 이용약관
              </ExtLink>
            </>
          ),
        },
      ],
    },
    {
      title: "7. 이용자의 권리와 행사 방법",
      blocks: [
        {
          kind: "p",
          text: (
            <>
              이용자는 언제든지 앱의 [마이페이지 → 관리 → YouTube 연결 해제]
              또는 Google 계정의 권한 관리(myaccount.google.com/permissions)에서
              KeepGo의 YouTube 접근 권한을 즉시 취소할 수 있습니다.
              열람·정정·삭제 등 그 밖의 요청은 아래 문의처로 보내 주세요.
            </>
          ),
        },
        {
          kind: "ul",
          items: [
            "개인정보 처리 현황의 열람 및 확인 요청",
            "오류의 정정 또는 삭제 요청",
            "처리 정지 요청 및 동의 철회",
            "Google·YouTube 계정 연동 해제",
            "회원 탈퇴 및 저장된 데이터의 삭제 요청",
          ],
        },
      ],
    },
    {
      title: "8. 개인정보의 안전성 확보 조치",
      blocks: [
        {
          kind: "ul",
          items: [
            "개인정보 및 인증 토큰의 전송 구간 암호화",
            "비밀번호와 주요 인증 정보의 안전한 보관",
            "접근 권한 최소화 및 접근 통제",
            "접속 기록의 보관 및 위·변조 방지",
            "취약점 점검 및 소프트웨어 업데이트",
            "개인정보 취급 직원의 관리·감독",
            "침해 사고 대응 및 복구 절차 마련",
          ],
        },
      ],
    },
    {
      title: "9. 쿠키 등 자동 수집 장치",
      blocks: [
        {
          kind: "p",
          text: "서비스는 로그인 상태 유지, 보안, 이용 환경 개선을 위해 쿠키 또는 이와 유사한 기술을 사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키를 거부하거나 삭제할 수 있으며, 필수 쿠키를 차단하면 로그인 등 일부 기능을 이용하지 못할 수 있습니다.",
        },
      ],
    },
    {
      title: "10. 개인정보처리방침의 변경",
      blocks: [
        {
          kind: "p",
          text: "개인정보처리방침을 변경하는 경우 시행 전에 서비스 내 또는 웹사이트를 통해 공지하며, 중요한 변경은 관련 법령에 따라 별도로 알립니다.",
        },
      ],
    },
    {
      title: "11. 개인정보 보호책임자 및 문의처",
      blocks: [
        {
          kind: "ul",
          items: [
            "서비스명: KeepGo",
            "담당 부서: 프라이버시 및 보안팀",
            <>문의: {CONTACT}</>,
          ],
        },
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: "KeepGo 서비스 이용약관",
  sections: [
    {
      title: "제1조 (목적)",
      blocks: [
        {
          kind: "p",
          text: "본 약관은 ‘KeepGo’(이하 “서비스”)가 제공하는 유튜브 쇼츠 기반 장소 추출 및 코스 추천 제반 서비스의 이용과 관련하여 이용자와 서비스 제공자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
        },
      ],
    },
    {
      title: "제2조 (용어의 정의)",
      blocks: [
        {
          kind: "ul",
          items: [
            "“이용자”란 본 약관에 동의하고 Google 계정 연동을 통해 서비스를 이용하는 회원을 의미합니다.",
            "“쇼츠 아카이브”란 이용자가 YouTube에서 좋아요를 표시한 쇼츠 동영상 중 AI가 장소 정보를 감지하여 구조화한 목록을 말합니다.",
            "“코스 추천”이란 추출된 장소들의 지리적 좌표와 이동 경로를 분석하여 AI가 제안하는 여행 일정을 말합니다.",
          ],
        },
      ],
    },
    {
      title: "제3조 (약관의 효력 및 변경)",
      blocks: [
        {
          kind: "ul",
          items: [
            "본 약관은 이용자가 서비스에서 동의 절차를 거쳐 이용을 시작한 때부터 효력이 생깁니다.",
            "서비스는 관련 법령을 어기지 않는 범위에서 약관을 바꿀 수 있습니다.",
            "약관을 바꿀 때에는 시행일과 바뀐 내용을 시행 전에 서비스 내 또는 웹사이트에 알립니다. 이용자에게 불리한 변경은 시행 전 충분한 기간을 두고 알립니다.",
            "바뀐 약관에 동의하지 않는 이용자는 서비스 이용을 멈추고 연동을 해제할 수 있습니다.",
          ],
        },
      ],
    },
    {
      title: "제4조 (서비스의 제공 및 한계)",
      blocks: [
        {
          kind: "p",
          text: "1. 서비스는 AI(Gemini) 멀티모달 분석을 통해 영상 속 정보를 추출하므로, 실제 매장의 영업시간, 휴무일, 폐업 여부 등은 현장 사정에 따라 상이할 수 있습니다. 중요한 방문 일정의 경우 실제 매장에 사전 확인을 권장합니다.",
        },
        {
          kind: "p",
          text: "2. 서비스는 천재지변, Google/YouTube API 시스템 장애, 정기점검 등으로 인한 일시적 중단이 발생할 수 있습니다.",
        },
        {
          kind: "p",
          text: "3. 서비스는 영상에서 장소를 찾지 못하거나 일부만 찾을 수 있으며, 3분 이하의 공개 영상만 분석할 수 있는 등 기술적 제약이 있을 수 있습니다.",
        },
      ],
    },
    {
      title: "제5조 (회원 가입 및 계정 연동)",
      blocks: [
        {
          kind: "ul",
          items: [
            "이용자는 Google 계정으로 로그인하고 본 약관과 개인정보처리방침에 동의하면 서비스를 이용할 수 있습니다.",
            "좋아요한 영상을 불러오려면 YouTube 계정 연동에 동의해야 합니다. 서비스는 읽기 전용 권한만 요청합니다.",
            "이용자는 언제든지 앱의 [마이페이지 → 관리 → YouTube 연결 해제] 또는 Google 계정의 권한 관리에서 연동을 끊을 수 있습니다.",
          ],
        },
      ],
    },
    {
      title: "제6조 (회원의 의무 및 계정 보안)",
      blocks: [
        {
          kind: "p",
          text: "이용자는 타인의 Google 계정을 도용하여 본 서비스를 이용하거나, 서비스의 정상적인 운영을 방해하는 자동화 스크립트, 크롤링 행위를 하여서는 안 됩니다. 이용자는 자신의 계정을 안전하게 관리할 책임이 있습니다.",
        },
        {
          kind: "p",
          text: "다음 행위도 금지합니다.",
        },
        {
          kind: "ul",
          items: [
            "서비스의 시스템, 소스 코드, 데이터에 무단으로 접근하거나 이를 변조하는 행위",
            "서비스를 이용해 얻은 정보를 서비스 제공자의 동의 없이 상업적으로 복제·배포하는 행위",
            "관련 법령 또는 공서양속에 어긋나는 행위",
          ],
        },
      ],
    },
    {
      title: "제7조 (YouTube 이용약관 및 콘텐츠의 권리)",
      blocks: [
        {
          kind: "ul",
          items: [
            <>
              서비스는 YouTube API 서비스를 이용합니다. 서비스를 이용하는 것은{" "}
              <ExtLink href="https://www.youtube.com/t/terms">
                YouTube 서비스 약관
              </ExtLink>
              에 동의하는 것으로 봅니다.
            </>,
            "영상, 썸네일, 제목 등 YouTube 콘텐츠의 저작권은 각 권리자에게 있으며, 서비스는 장소 정보를 보여 주기 위한 범위에서만 이를 이용합니다.",
            "이용자가 서비스에 저장한 장소 목록과 코스 구성은 이용자의 것이며, 서비스는 이를 서비스 제공 외의 목적으로 이용하지 않습니다.",
            "서비스가 제공하는 화면, 디자인, 소프트웨어에 대한 권리는 서비스 제공자에게 있습니다.",
          ],
        },
      ],
    },
    {
      title: "제8조 (서비스의 변경 및 중단)",
      blocks: [
        {
          kind: "ul",
          items: [
            "서비스는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 바꾸거나 중단할 수 있습니다.",
            "서비스를 바꾸거나 중단할 때에는 사전에 서비스 내 또는 웹사이트에 알립니다. 다만 긴급한 장애 대응 등 사전 공지가 어려운 경우에는 사후에 알립니다.",
          ],
        },
      ],
    },
    {
      title: "제9조 (이용 제한 및 해지)",
      blocks: [
        {
          kind: "ul",
          items: [
            "이용자가 제6조를 어기거나 서비스 운영을 방해하면 서비스는 경고 후 이용을 제한할 수 있습니다.",
            "이용자는 언제든지 연동을 해제하거나 문의처로 회원 탈퇴를 요청해 이용을 끝낼 수 있습니다.",
            "탈퇴 또는 연동 해제 시 이용자의 데이터는 개인정보처리방침에 따라 파기합니다.",
          ],
        },
      ],
    },
    {
      title: "제10조 (책임의 제한)",
      blocks: [
        {
          kind: "ul",
          items: [
            "서비스는 천재지변, 외부 서비스(Google, YouTube, 지도 사업자 등)의 장애 등 서비스가 통제할 수 없는 사유로 생긴 손해에 대해 책임을 지지 않습니다.",
            "AI가 추출한 장소 정보와 추천 코스는 참고용이며, 이를 바탕으로 한 이용자의 판단과 방문에 대해 서비스는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.",
            "이용자가 본 약관을 어겨 생긴 손해는 이용자가 책임집니다.",
          ],
        },
      ],
    },
    {
      title: "제11조 (분쟁의 해결)",
      blocks: [
        {
          kind: "p",
          text: "서비스와 이용자 사이에 분쟁이 생기면 양쪽이 성실히 협의해 풀도록 하며, 협의가 되지 않으면 대한민국 법령을 따릅니다. 문의는 아래 이메일로 받습니다.",
        },
        {
          kind: "ul",
          items: [<>문의: {CONTACT}</>],
        },
      ],
    },
  ],
};
