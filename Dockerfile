# 기본 이미지로 node:18-alpine 사용
FROM node:18-alpine AS base

# 1) 의존성 설치 스테이지
FROM base AS deps
# node:18-alpine은 musl libc를 사용하는데, musl libc와 glibc 간 호환성 문제가 있을 수 있기 때문에 libc6-compat 설치
RUN apk add --no-cache libc6-compat
# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# 사용하는 패키지 매니저에 따라 의존성 설치
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# 2) 빌드 스테이지
FROM base AS builder
# 작업 디렉토리를 /app으로 설정
WORKDIR /app
# node_modules 디렉토리 복사
COPY --from=deps /app/node_modules ./node_modules
# 소스코드 복사
COPY . .

# 소스코드 빌드
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 3) 프로덕션 이미지 실행 스테이지
FROM base AS runner
# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# NODE_ENV 환경 변수 설정
ENV NODE_ENV production

# 그룹 및 유저 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 자원 복사
COPY --from=builder /app/public ./public

# .next 디렉토리 권한 설정
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 빌드 결과물 복사 및 파일 소유자 설정
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 설정
USER nextjs

# 3000번 포트를 외부로 노출
EXPOSE 3000

# 포트 환경 변수 설정
ENV PORT 3000
ENV NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}

# 컨테이너가 시작될 떄 실행할 명령어 설정: next.js를 빌드한 결과물 중 하나인 server.js를 실행
CMD HOSTNAME="0.0.0.0" node server.js
