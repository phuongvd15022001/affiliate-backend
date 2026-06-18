# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# ── Stage 2: production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3300

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main"]
