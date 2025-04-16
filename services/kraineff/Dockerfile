FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# Установка зависимостей
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Сборка и тестирование
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Сборка для продакшена
ENV NODE_ENV=production
RUN bun run build

# Запуск
FROM base AS release
COPY --from=prerelease /usr/src/app/build.js .
USER bun
EXPOSE 3000/tcp
CMD ["bun", "run", "build.js"]