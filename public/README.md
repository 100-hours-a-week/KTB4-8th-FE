# public/

## youtube.svg — 공식 로고를 직접 넣어야 합니다

`좋아요 영상 불러오기` 버튼과 마이페이지의 연동 표시에 쓰는 YouTube 마크는
**YouTube 브랜드 가이드의 배포 파일**을 써야 합니다. 직접 그린 로고는 쓸 수 없습니다.

1. https://www.youtube.com/howyoutubeworks/resources/brand-resources/ 에서
   _YouTube icon_ (RGB, full-color) SVG 를 받습니다.
2. 이 폴더에 `youtube.svg` 로 저장합니다.
3. `.env.local` 에 `NEXT_PUBLIC_YOUTUBE_LOGO=/youtube.svg` 를 추가합니다.

설정하지 않으면 일반 '영상 재생' 배지(빨간 라운드 사각 + 흰 삼각형)로 대체됩니다.
Google 로그인 버튼의 'G' 마크도 같은 이유로 공식 에셋으로 교체하는 것을 권합니다.
