# add-travel-itinerary

Private web app to manually add travel reservations and send Gmail-compatible confirmation emails with JSON-LD (`FlightReservation`, `LodgingReservation`).

## Features

- Google OAuth sign-in with strict allowlist (`ALLOWED_EMAIL`)
- Manual forms for flight and hotel itineraries
- Sends transactional email via Resend
- Embeds Schema.org JSON-LD in email HTML body
- Stores send history in Cloudflare D1
- Resend action for previous itineraries

## Stack

- Next.js (App Router) + TypeScript
- Auth.js / NextAuth (Google provider)
- Drizzle ORM + Cloudflare D1
- Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- Vitest for unit/integration tests

## Required environment variables

```bash
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ALLOWED_EMAIL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Copy env values.

```bash
cp .env.example .env.local
```

3. Run the app.

```bash
npm run dev
```

## Database setup

- D1 table migration lives in `drizzle/0000_initial.sql`.
- Configure `database_id` in `wrangler.jsonc`.
- Apply migrations with Wrangler.

Example:

```bash
wrangler d1 migrations apply travel-itinerary --local
```

## Cloudflare deployment

Build and deploy with OpenNext:

```bash
npm run cf:build
npm run cf:deploy
```

## CI/CD

GitHub Actions workflow is defined at `.github/workflows/ci-cd.yml`.

- On pull requests: install, typecheck, test, `next build`, OpenNext Cloudflare build
- On push to `main`: deploy to Cloudflare Workers through `cloudflare/wrangler-action`

Required repository secrets for deployment job:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Notes

- Gmail parsing is best-effort for personal use in v1.
- SPF/DKIM/DMARC and verified sender domain are required for reliable deliverability.
