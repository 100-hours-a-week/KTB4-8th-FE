# KTB4-8th-FE

## package.json 스크립트 설명

JSON은 주석을 허용하지 않아 설명을 여기에 둡니다. 스크립트 값은 변경하지 않았습니다.

| 스크립트 | 역할 |
| --- | --- |
| `dev` | Next.js 개발 서버를 실행합니다. 운영 컨테이너용 명령이 아닙니다. |
| `build` | 프로덕션 빌드를 만듭니다. 현재 `output: "standalone"` 설정은 Node 서버용 산출물을 생성합니다. |
| `start` | 일반적인 Next.js 프로덕션 서버 명령입니다. standalone 전용 이미지에서는 생성된 `server.js`를 `node server.js`로 실행합니다. |
| `lint` | ESLint를 실행하고 경고가 있어도 실패 처리합니다. 현재 CI에서는 여전히 실행합니다. |
| `typecheck` | TypeScript 타입을 검사하며 파일을 출력하지 않습니다. |
| `test` | Vitest를 실행합니다. 개발 환경에서는 변경 감시 모드로 동작할 수 있습니다. |
| `test:ci` | Vitest를 한 번 실행하고 커버리지를 수집합니다. |
| `storybook` | 6006 포트에서 컴포넌트 개발 화면을 실행합니다. |
| `build-storybook` | Storybook 정적 배포 파일을 만듭니다. 서비스의 Next.js 빌드와 별개입니다. |
| `e2e` | Playwright로 브라우저 종단 간 테스트를 실행합니다. 현재 CI에는 호출 단계가 없습니다. |

## 현재 파일을 읽을 때 주의할 점

- 현재 로컬 사본의 `package.json`에는 scripts만 있고 의존성 선언과 lock 파일, 실제 앱 소스가 없습니다. 이 파일들만으로 빌드가 완성되지는 않습니다.
- `next.config.ts`는 standalone으로 바뀌었지만 CI에는 아직 정적 `out/` 검사와 단일 이미지 발행 흐름이 남아 있습니다.
- FE에서 Next.js와 Nginx 이미지를 각각 만들고 main push에 검증·발행하는 것이 전환 목표입니다. 이번 주석 작업에서 CI 실행 조건은 바꾸지 않았습니다.
- Cloud 저장소의 운영 배포는 수동 실행을 유지합니다. FE CI의 ECR push는 운영 배포와 다릅니다.
