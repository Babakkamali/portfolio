# portfolio

Source of my personal site, [babakkamali.com](https://babakkamali.com).

```sh
npm install
npm run dev
```

## Container image

Every push to `main` builds an image for amd64 and arm64, scans it with Trivy, signs it with cosign and pushes it to the GitHub container registry.

```sh
docker run --rm -p 8080:8080 ghcr.io/babakkamali/portfolio:latest
```

It runs nginx as a non-root user, with a health check on `/healthz`. The contact form only sends on the hosted site.

To check the signature:

```sh
cosign verify ghcr.io/babakkamali/portfolio:latest \
  --certificate-identity-regexp '^https://github.com/Babakkamali/portfolio/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```
