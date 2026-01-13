# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

ARG PNPM_VERSION=9.5.0
RUN npm install -g pnpm@$PNPM_VERSION

# Build client
FROM base AS client-build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY client/package.json client/pnpm-lock.yaml ./client/
WORKDIR /app/client
RUN pnpm install --frozen-lockfile
COPY client/ .
RUN pnpm run build

# Build server
FROM base AS server-build

COPY server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY server/ .
RUN pnpm run build
COPY --from=client-build /app/client/dist ./dist

# Production stage
FROM base

ENV NODE_ENV="production"

COPY --from=server-build /app/ .

EXPOSE 3000

CMD ["node", "build/index.js"]