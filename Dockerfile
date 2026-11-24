# syntax=docker/dockerfile:1

FROM node:22.22.1-alpine AS build
WORKDIR /app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.7-alpine AS runtime
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
