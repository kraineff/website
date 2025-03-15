FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---

FROM oven/bun:slim AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY src/ .env ./

USER bun
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]