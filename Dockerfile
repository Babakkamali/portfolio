# syntax=docker/dockerfile:1

# The build output is the same on every platform, so it is built once on the runner's own platform.
FROM --platform=$BUILDPLATFORM node:22.22.1-alpine@sha256:8094c002d08262dba12645a3b4a15cd6cd627d30bc782f53229a2ec13ee22a00 AS build
WORKDIR /app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.7-alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e AS runtime
LABEL org.opencontainers.image.source="https://github.com/Babakkamali/portfolio" \
      org.opencontainers.image.description="babakkamali.com served by nginx"
COPY --link docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --link docker/security-headers.inc /etc/nginx/conf.d/security-headers.inc
COPY --link --from=build /app/dist /usr/share/nginx/html
# Pick up security fixes released after the base image was built.
USER root
RUN --mount=type=cache,target=/etc/apk/cache,sharing=locked apk upgrade
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
