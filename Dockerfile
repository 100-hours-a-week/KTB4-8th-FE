# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* 는 빌드 시점에 번들에 박힌다 (컨테이너 env로 나중에 못 바꾼다)
ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ARG NEXT_PUBLIC_USE_MOCK=false
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
ARG NEXT_PUBLIC_JUSO_API_KEY
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
# Sentry — DSN · 환경은 공개 값이라 빌드 인자로 박는다. 인증 토큰은 아래 BuildKit secret 으로만 받는다.
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_RELEASE
ARG NEXT_PUBLIC_CHAT_V2
ARG NEXT_PUBLIC_WISHLIST_V2
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_USE_MOCK=${NEXT_PUBLIC_USE_MOCK} \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
    NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID} \
    NEXT_PUBLIC_JUSO_API_KEY=${NEXT_PUBLIC_JUSO_API_KEY} \
    NEXT_PUBLIC_CLARITY_PROJECT_ID=${NEXT_PUBLIC_CLARITY_PROJECT_ID} \
    NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN} \
    NEXT_PUBLIC_CHAT_V2=${NEXT_PUBLIC_CHAT_V2} \
    NEXT_PUBLIC_WISHLIST_V2=${NEXT_PUBLIC_WISHLIST_V2} \
    NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT} \
    SENTRY_ORG=${SENTRY_ORG} \
    SENTRY_PROJECT=${SENTRY_PROJECT} \
    SENTRY_RELEASE=${SENTRY_RELEASE}

# SENTRY_AUTH_TOKEN 은 이 RUN 한 줄에서만 보이고 이미지 레이어에 남지 않는다.
# secret 이 없으면(로컬 빌드) 빈 값이 되어 소스맵 업로드만 건너뛴다.
RUN --mount=type=secret,id=sentry_auth_token \
    mkdir -p public && \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN mkdir .next && chown node:node .next

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000

CMD ["node", "server.js"]
