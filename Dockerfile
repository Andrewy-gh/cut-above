# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

ARG PNPM_VERSION=9.5.0
RUN npm install -g pnpm@$PNPM_VERSION

# Build client
FROM base AS client-build

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY client/ ./client/
WORKDIR /app
RUN pnpm install --frozen-lockfile --filter ./client...
WORKDIR /app/client
RUN pnpm run build

# Build server
FROM base AS server-build

COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY server/ /app/server/
COPY shared/ /app/shared/
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @cut-above/shared build
RUN pnpm --filter cut-above-sql build
COPY --from=client-build /app/client/dist /app/server/dist

# Production stage
FROM base

ENV NODE_ENV="production"

WORKDIR /app
COPY --from=server-build /app/ /app/

EXPOSE 3000

WORKDIR /app/server
CMD ["node", "build/index.js"]
