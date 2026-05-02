# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER app

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
